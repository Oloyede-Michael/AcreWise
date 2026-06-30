package com.autocollect.reflow.service;

import com.autocollect.reflow.domain.PaymentMethod;
import com.autocollect.reflow.domain.Subscription;
import com.autocollect.reflow.repository.PaymentMethodRepository;
import com.autocollect.reflow.repository.SubscriptionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.LocalDate;
import java.util.List;

@Service
@Slf4j
@RequiredArgsConstructor
public class SubscriptionBillingScheduler {

    private final SubscriptionRepository subscriptionRepository;
    private final PaymentMethodRepository paymentMethodRepository;
    private final NombaIntegrationService nombaService;
    private final RedisLockService lockService;

    /**
     * Automated recurring engine loop. 
     * Runs automatically every hour to parse subscriptions due for renewal.
     */
    @Scheduled(cron = "0 0 * * * *")
    @Transactional
    public void processRecurringBillingLoop() {
        log.info("Subscription Scheduler: Scanning database records for due subscription lifecycles...");
        
        LocalDate today = LocalDate.now();
        // Pull accounts that are ACTIVE or in a DUNNING window and have crossed their billing date thresholds
        List<Subscription> dueSubscriptions = subscriptionRepository.findByNextBillingDateBeforeAndStatusIn(
                today.plusDays(1),
                List.of("ACTIVE", "DUNNING", "RENEWAL_DUE")
        );

        for (Subscription subscription : dueSubscriptions) {
            String subIdStr = subscription.getId().toString();

            // Acquire an atomic distributed lock via Redis to prevent duplicate processing strings
            boolean acquiredLock = lockService.acquireSubscriptionLock(subIdStr, Duration.ofMinutes(10));
            if (!acquiredLock) {
                log.warn("Skipping run. Distributed lock active in Redis for subscription reference: {}", subIdStr);
                continue;
            }

            try {
                executeBillingTransaction(subscription);
            } catch (Exception e) {
                log.error("Execution fault processing transaction for subscription [{}]: {}", subIdStr, e.getMessage());
            } finally {
                lockService.releaseSubscriptionLock(subIdStr);
            }
        }
    }

    private void executeBillingTransaction(Subscription subscription) {
        List<PaymentMethod> paymentMethods = paymentMethodRepository.findByCustomerIdOrderByIsPrimaryDesc(
                subscription.getCustomer().getId()
        );

        if (paymentMethods.isEmpty()) {
            log.warn("Subscription [{}]: Aborting renewal. No valid payment tokens registered.", subscription.getId());
            subscription.setStatus("PAST_DUE");
            subscriptionRepository.save(subscription);
            return;
        }

        // Always pull index 0 as it maps directly to the designated Primary Card
        PaymentMethod primaryCard = paymentMethods.get(0);

        log.info("Processing transaction via Nomba for Subscription: {}, using card ending in: {}", 
                subscription.getId(), primaryCard.getLast4());

        // Call our tokenized OpenAPI charge mapper service synchronously inside our execution worker threads
        NombaIntegrationService.NombaChargeResponse apiResponse = nombaService.chargeTokenizedCard(
                primaryCard.getToken(),
                subscription.getPlan().getAmount(),
                subscription.getCustomer().getEmail(),
                subscription.getCustomer().getId().toString()
        ).block();

        if (apiResponse != null && apiResponse.success()) {
            log.info("Transaction approved! Subscription [{}] successfully renewed.", subscription.getId());
            subscription.setStatus("ACTIVE");
            subscription.setNextBillingDate(calculateNextBillingDate(subscription.getPlan().getFrequency()));
            subscriptionRepository.save(subscription);
        } else {
            String errCode = apiResponse != null ? apiResponse.code() : "UNKNOWN_GATEWAY_ERROR";
            log.warn("Transaction declined by Nomba with exception code: {}. Route to recovery engine path.", errCode);
            
            // Mark state as DUNNING to let the gRPC retry engine isolate it for future backoff tasks
            subscription.setStatus("DUNNING");
            subscriptionRepository.save(subscription);
            
            triggerAsyncRecoveryNotification(subscription, errCode);
        }
    }

    private LocalDate calculateNextBillingDate(String frequency) {
        return switch (frequency.toUpperCase()) {
            case "WEEKLY" -> LocalDate.now().plusWeeks(1);
            case "ANNUALLY" -> LocalDate.now().plusYears(1);
            default -> LocalDate.now().plusMonths(1); // Default to Monthly billing standard
        };
    }

    private void triggerAsyncRecoveryNotification(Subscription subscription, String reasonCode) {
        log.info("Dunning Alert: Sending transaction update payload to customer phone [{}] for reason: {}", 
                subscription.getCustomer().getPhone(), reasonCode);
        // Integrate third-party messaging utility endpoints here
    }
}