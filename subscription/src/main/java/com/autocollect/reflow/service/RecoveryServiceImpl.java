package com.autocollect.reflow.service;

import com.autocollect.reflow.grpc.RecoveryServiceGrpc;
import com.autocollect.reflow.grpc.RetryRequest;
import com.autocollect.reflow.grpc.RetryResponse;
import com.autocollect.reflow.domain.PaymentMethod;
import com.autocollect.reflow.domain.Subscription;
import com.autocollect.reflow.repository.PaymentMethodRepository;
import com.autocollect.reflow.repository.SubscriptionRepository;
import io.grpc.stub.StreamObserver;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import net.devh.boot.grpc.server.service.GrpcService;
import java.math.BigDecimal;
import java.time.Instant;
import java.time.Duration;
import java.util.List;
import java.util.UUID;

@GrpcService // Tells net.devh framework to automatically register this service bean on the gRPC port
@Slf4j
@RequiredArgsConstructor
public class RecoveryServiceImpl extends RecoveryServiceGrpc.RecoveryServiceImplBase {

    private final PaymentMethodRepository paymentMethodRepository;
    private final SubscriptionRepository subscriptionRepository;
    private final NombaIntegrationService nombaService;
    private final RedisLockService lockService;

    @Override
    public void triggerSmartRetry(RetryRequest request, StreamObserver<RetryResponse> responseObserver) {
        log.info("gRPC Microservice Hook: Processing recovery retry loop execution context for subscription ID: {}", request.getSubscriptionId());

        UUID subId = UUID.fromString(request.getSubscriptionId());
        
        // 1. Acquire Distributed Redis Lock to prevent race condition double charging
        boolean hasLock = lockService.acquireSubscriptionLock(request.getSubscriptionId(), Duration.ofMinutes(5));
        if (!hasLock) {
            log.warn("Aborting gRPC run. Concurrent processing lock active in Redis for target: {}", request.getSubscriptionId());
            responseObserver.onNext(RetryResponse.newBuilder()
                    .setStatus("ABANDONED")
                    .setResolution("CONCURRENT_PROCESS_BLOCKED")
                    .build());
            responseObserver.onCompleted();
            return;
        }

        try {
            Subscription subscription = subscriptionRepository.findById(subId)
                    .orElseThrow(() -> new IllegalArgumentException("Target subscription entity absent."));

            // 2. Resolve saved token cards (Index 0 = primary, sequential indexes = fallback multi-card assets)
            List<PaymentMethod> cards = paymentMethodRepository.findByCustomerIdOrderByIsPrimaryDesc(subscription.getCustomer().getId());
            
            if (cards.isEmpty()) {
                responseObserver.onNext(RetryResponse.newBuilder()
                        .setStatus("ABANDONED")
                        .setResolution("MAX_ATTEMPTS_EXHAUSTED")
                        .build());
                responseObserver.onCompleted();
                return;
            }

            // Determine card index selection based on attempt context numbers
            PaymentMethod activeCardSelection = cards.get(0);
            BigDecimal billingAmount = BigDecimal.valueOf(request.getOriginalAmount());

            // Multi-card recovery routing: switch to backup instruments if primary fails persistently
            if (request.getAttemptNumber() > 1 && cards.size() > 1) {
                log.info("Primary card declined previously. Activating multi-card automated fallback token path...");
                activeCardSelection = cards.get(1);
            }

            // Execute the outbound REST payload via our custom integration client
            NombaIntegrationService.NombaChargeResponse gatewayResult = nombaService.chargeTokenizedCard(
                    activeCardSelection.getToken(),
                    billingAmount,
                    subscription.getCustomer().getEmail(),
                    subscription.getCustomer().getId().toString()
            ).block(); // gRPC runs on standard synchronous worker pools; blocking here is correct design practice

            RetryResponse.Builder protobufBuilder = RetryResponse.newBuilder();

            if (gatewayResult.success()) {
                log.info("Revenue recovery loop successful via gRPC pipeline invocation!");
                subscription.setStatus("ACTIVE");
                subscriptionRepository.save(subscription);

                protobufBuilder.setStatus("EXECUTED")
                        .setResolution("SUCCESS")
                        .setFinalAmountCharged(billingAmount.doubleValue());
            } else {
                log.warn("Nomba transaction retry declined with code: {}", gatewayResult.code());
                
                // Orchestrate the dynamic African dynamic timeline backoff offsets
                Instant dynamicNextBackoff = Instant.now().plus(Duration.ofDays(request.getAttemptNumber() == 1 ? 1 : 3));

                protobufBuilder.setStatus("PENDING")
                        .setResolution("RE-SCHEDULED")
                        .setNextRetryTimestamp(dynamicNextBackoff.toString());
            }

            responseObserver.onNext(protobufBuilder.build());
            responseObserver.onCompleted();

        } catch (Exception e) {
            log.error("Internal processing failure inside gRPC recovery task loop: {}", e.getMessage());
            responseObserver.onError(io.grpc.Status.INTERNAL.withDescription(e.getMessage()).asRuntimeException());
        } finally {
            lockService.releaseSubscriptionLock(request.getSubscriptionId());
        }
    }
}