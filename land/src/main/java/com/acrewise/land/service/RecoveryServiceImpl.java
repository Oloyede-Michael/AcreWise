package com.acrewise.land.service;

import com.acrewise.land.grpc.EscrowServiceGrpc;
import com.acrewise.land.grpc.HoldRequest;
import com.acrewise.land.grpc.HoldResponse;
import com.acrewise.land.grpc.ReleaseRequest;
import com.acrewise.land.grpc.ReleaseResponse;
import com.acrewise.land.grpc.RefundRequest;
import com.acrewise.land.grpc.RefundResponse;
import com.acrewise.land.domain.EscrowTransaction;
import com.acrewise.land.domain.Property;
import com.acrewise.land.domain.Landlord;
import com.acrewise.land.repository.EscrowTransactionRepository;
import com.acrewise.land.repository.PropertyRepository;
import io.grpc.stub.StreamObserver;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import net.devh.boot.grpc.server.service.GrpcService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.Map;
import java.util.UUID;

@GrpcService
@Slf4j
@RequiredArgsConstructor
public class RecoveryServiceImpl extends EscrowServiceGrpc.EscrowServiceImplBase {

    private final EscrowTransactionRepository escrowTransactionRepository;
    private final PropertyRepository propertyRepository;
    private final NombaAuthService authService;
    private final WebClient webClient;

    @Value("${nomba.api.account-id}")
    private String accountId;

    @Value("${nomba.api.sub-account-id:}")
    private String subAccountId;

    @Override
    public void hold(HoldRequest request, StreamObserver<HoldResponse> responseObserver) {
        log.info("gRPC Escrow Hold: Initiating hold for property: {}, buyer: {}", request.getPropertyId(), request.getBuyerId());

        try {
            Property property = propertyRepository.findById(UUID.fromString(request.getPropertyId()))
                    .orElseThrow(() -> new IllegalArgumentException("Property not found."));

            EscrowTransaction transaction = EscrowTransaction.builder()
                    .property(property)
                    .buyerId(request.getBuyerId())
                    .amountHeld(BigDecimal.valueOf(request.getAmount()))
                    .nombaVirtualAccountId(request.getNombaVirtualAccountId())
                    .status("HELD")
                    .build();

            EscrowTransaction saved = escrowTransactionRepository.save(transaction);

            HoldResponse response = HoldResponse.newBuilder()
                    .setId(saved.getId().toString())
                    .setStatus(saved.getStatus())
                    .setAmountHeld(saved.getAmountHeld().doubleValue())
                    .build();

            responseObserver.onNext(response);
            responseObserver.onCompleted();

        } catch (Exception e) {
            log.error("gRPC Escrow Hold Failed: {}", e.getMessage());
            responseObserver.onError(io.grpc.Status.INTERNAL.withDescription(e.getMessage()).asRuntimeException());
        }
    }

    @Override
    public void release(ReleaseRequest request, StreamObserver<ReleaseResponse> responseObserver) {
        log.info("gRPC Escrow Release: Initiating payout release for Escrow Transaction ID: {}", request.getEscrowTransactionId());

        try {
            EscrowTransaction escrow = escrowTransactionRepository.findById(UUID.fromString(request.getEscrowTransactionId()))
                    .orElseThrow(() -> new IllegalArgumentException("Escrow transaction not found."));

            if (!"HELD".equalsIgnoreCase(escrow.getStatus())) {
                throw new IllegalStateException("Escrow transaction is not in HELD state. Current status: " + escrow.getStatus());
            }

            Landlord landlord = escrow.getProperty().getLandlord();
            if (landlord.getBankAccountNumber() == null || landlord.getBankCode() == null) {
                throw new IllegalStateException("Landlord payout bank details are required before release.");
            }
            String bankAccount = landlord.getBankAccountNumber();
            String bankCode = landlord.getBankCode();
            String transferRef = UUID.randomUUID().toString();

            // Execute the outbound payout REST API call to Nomba
            boolean transferSuccess = executeNombaTransfer(escrow.getAmountHeld(), bankAccount, landlord.getName(), bankCode, transferRef, "Escrow release to landlord");

            if (transferSuccess) {
                escrow.setStatus("RELEASED");
                escrow.setReleasedAt(Instant.now());
                escrowTransactionRepository.save(escrow);

                ReleaseResponse response = ReleaseResponse.newBuilder()
                        .setEscrowTransactionId(escrow.getId().toString())
                        .setStatus("RELEASED")
                        .setTransferReference(transferRef)
                        .build();

                responseObserver.onNext(response);
                responseObserver.onCompleted();
            } else {
                throw new RuntimeException("Nomba Outbound Payout transfer failed.");
            }

        } catch (Exception e) {
            log.error("gRPC Escrow Release Failed: {}", e.getMessage());
            responseObserver.onError(io.grpc.Status.INTERNAL.withDescription(e.getMessage()).asRuntimeException());
        }
    }

    @Override
    public void refund(RefundRequest request, StreamObserver<RefundResponse> responseObserver) {
        log.info("gRPC Escrow Refund: Initiating refund for Escrow Transaction ID: {}", request.getEscrowTransactionId());

        try {
            EscrowTransaction escrow = escrowTransactionRepository.findById(UUID.fromString(request.getEscrowTransactionId()))
                    .orElseThrow(() -> new IllegalArgumentException("Escrow transaction not found."));

            if (!"HELD".equalsIgnoreCase(escrow.getStatus())) {
                throw new IllegalStateException("Escrow transaction is not in HELD state. Current status: " + escrow.getStatus());
            }

            if (escrow.getNombaTransactionReference() == null) {
                throw new IllegalStateException("Nomba payment reference is required before refund.");
            }
            String transferRef = escrow.getNombaTransactionReference();
            boolean transferSuccess = executeNombaRefund(escrow.getNombaTransactionReference(), escrow.getAmountHeld());

            if (transferSuccess) {
                escrow.setStatus("REFUNDED");
                escrowTransactionRepository.save(escrow);

                RefundResponse response = RefundResponse.newBuilder()
                        .setEscrowTransactionId(escrow.getId().toString())
                        .setStatus("REFUNDED")
                        .setTransferReference(transferRef)
                        .build();

                responseObserver.onNext(response);
                responseObserver.onCompleted();
            } else {
                throw new RuntimeException("Nomba Outbound Refund transfer failed.");
            }

        } catch (Exception e) {
            log.error("gRPC Escrow Refund Failed: {}", e.getMessage());
            responseObserver.onError(io.grpc.Status.INTERNAL.withDescription(e.getMessage()).asRuntimeException());
        }
    }

    private boolean executeNombaTransfer(BigDecimal amount, String accountNumber, String accountName, String bankCode, String reference, String narration) {
        try {
            String accessToken = authService.getAccessToken().block();

            Map<String, Object> payload = Map.of(
                "amount", amount.doubleValue(),
                "accountNumber", accountNumber,
                "accountName", accountName,
                "bankCode", bankCode,
                "merchantTxRef", reference,
                "senderName", "AcreWise Escrow",
                "narration", narration
            );

            log.info("Nomba Outbound Payout Request: {}", payload);

            Map response = webClient.post()
                    .uri(subAccountId == null || subAccountId.isBlank()
                            ? "/v2/transfers/bank"
                            : "/v2/transfers/bank/" + subAccountId)
                    .header("Authorization", "Bearer " + accessToken)
                    .header("accountId", accountId)
                    .bodyValue(payload)
                    .retrieve()
                    .bodyToMono(Map.class)
                    .onErrorResume(err -> {
                        log.error("Error from Nomba Outbound Payout API: {}", err.getMessage());
                        return Mono.empty();
                    })
                    .block();

            if (response != null) {
                log.info("Nomba Outbound Payout Response: {}", response);
                String code = (String) response.get("code");
                // Nomba sandbox / production returns "00" on success or check response map
                return "00".equals(code) || (response.get("status") != null && response.get("status").toString().toLowerCase().contains("success"));
            }
            
            return false;
        } catch (Exception e) {
            log.error("Exception during Nomba transfer: {}", e.getMessage());
            return false;
        }
    }

    private boolean executeNombaRefund(String transactionId, BigDecimal amount) {
        try {
            String accessToken = authService.getAccessToken().block();
            Map<String, Object> payload = Map.of(
                    "transactionId", transactionId,
                    "amount", amount.doubleValue()
            );
            Map response = webClient.post()
                    .uri("/v1/checkout/refund")
                    .header("Authorization", "Bearer " + accessToken)
                    .header("accountId", accountId)
                    .bodyValue(payload)
                    .retrieve()
                    .bodyToMono(Map.class)
                    .block();
            return response != null && "00".equals(String.valueOf(response.get("code")));
        } catch (Exception e) {
            log.error("Exception during Nomba refund: {}", e.getMessage());
            return false;
        }
    }
}
