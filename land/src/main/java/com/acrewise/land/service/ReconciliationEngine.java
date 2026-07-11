package com.acrewise.land.service;

import com.acrewise.land.domain.EscrowTransaction;
import com.acrewise.land.domain.RentPayment;
import com.acrewise.land.domain.Tenancy;
import com.acrewise.land.repository.EscrowTransactionRepository;
import com.acrewise.land.repository.RentPaymentRepository;
import com.acrewise.land.repository.TenancyRepository;
import com.acrewise.land.repository.PropertyRepository;
import com.acrewise.land.repository.ReceiptRepository;
import com.acrewise.land.domain.Receipt;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import reactor.core.publisher.Mono;
import reactor.core.scheduler.Schedulers;

import java.math.BigDecimal;
import java.time.Duration;
import java.time.Instant;
import java.time.LocalDate;
import java.util.Optional;

@Service
@Slf4j
@RequiredArgsConstructor
public class ReconciliationEngine {

    private final TenancyRepository tenancyRepository;
    private final RentPaymentRepository rentPaymentRepository;
    private final EscrowTransactionRepository escrowTransactionRepository;
    private final PropertyRepository propertyRepository;
    private final ReceiptRepository receiptRepository;
    private final RedisLockService lockService;

    /**
     * Reactively processes the inbound webhook payment.
     * Uses Mono.fromCallable to run the blocking JPA operations on the boundedElastic thread pool.
     */
    public Mono<String> processWebhookPayment(String virtualAccountId, String orderReference, BigDecimal amount, String nombaReference, Instant receivedAt) {
        return Mono.fromCallable(() -> {
            return executeReconciliation(virtualAccountId, orderReference, amount, nombaReference, receivedAt);
        }).subscribeOn(Schedulers.boundedElastic());
    }

    @Transactional
    public String executeReconciliation(String virtualAccountId, String orderReference, BigDecimal amount, String nombaReference, Instant receivedAt) {
        log.info("Reconciliation Engine: Starting payment matching for Ref [{}], Account [{}], Amount [{}]", 
                nombaReference, virtualAccountId, amount);

        // 1. Acquire Distributed Redis Lock for the transaction reference to prevent race conditions
        boolean hasLock = lockService.acquireLock(nombaReference, Duration.ofMinutes(5));
        if (!hasLock) {
            log.warn("Reconciliation Engine: Duplicate request blocked. Transaction [{}] is currently being processed.", nombaReference);
            return "DUPLICATE_PROCESSING";
        }

        try {
            // 2. Idempotency Check: check if reference already exists in database
            if (rentPaymentRepository.existsByNombaReference(nombaReference)) {
                log.info("Reconciliation Engine: Transaction [{}] already reconciled in rent payments.", nombaReference);
                return "ALREADY_PROCESSED";
            }

            // 3. Match against Tenancies first (Rent Collection Flow)
            Optional<Tenancy> tenancyOpt = tenancyRepository.findByNombaVirtualAccountId(virtualAccountId);
            if (tenancyOpt.isEmpty() && orderReference != null && !orderReference.isBlank()) {
                tenancyOpt = tenancyRepository.findByNombaOrderReference(orderReference);
            }
            if (tenancyOpt.isPresent()) {
                Tenancy tenancy = tenancyOpt.get();
                BigDecimal rentDue = tenancy.getRentAmount();
                String matchedStatus;

                int comparison = amount.compareTo(rentDue);
                if (comparison == 0) {
                    // Exact Payment
                    matchedStatus = "MATCHED";
                    tenancy.setBalance(BigDecimal.ZERO);
                    tenancy.setNextDueDate(advanceDueDate(tenancy.getNextDueDate(), tenancy.getFrequency()));
                    log.info("Reconciliation Engine: Match SUCCESS for tenancy [{}]. Due date advanced.", tenancy.getId());
                } else if (comparison < 0) {
                    // Partial Payment (Underpaid)
                    matchedStatus = "UNDERPAID";
                    BigDecimal arrears = amount.subtract(rentDue); // negative value represent arrears/shortfall
                    tenancy.setBalance(arrears);
                    log.warn("Reconciliation Engine: UNDERPAYMENT detected for tenancy [{}]. Arrears: {}", tenancy.getId(), arrears);
                } else {
                    // Excess Payment (Overpaid)
                    matchedStatus = "OVERPAID";
                    BigDecimal credit = amount.subtract(rentDue); // positive credit
                    tenancy.setBalance(credit);
                    log.info("Reconciliation Engine: OVERPAYMENT detected for tenancy [{}]. Credit: {}", tenancy.getId(), credit);
                }

                tenancyRepository.save(tenancy);

                RentPayment payment = RentPayment.builder()
                        .tenancy(tenancy)
                        .amount(amount)
                        .nombaReference(nombaReference)
                        .matchedStatus(matchedStatus)
                        .receivedAt(receivedAt != null ? receivedAt : Instant.now())
                        .build();

                rentPaymentRepository.save(payment);
                createReceiptIfMissing(
                        "Rent Payment",
                        "RENT",
                        amount,
                        nombaReference,
                        "Nomba payment reconciled for " + tenancy.getProperty().getTitle(),
                        tenancy.getTenantId()
                );
                return matchedStatus;
            }

            // 4. Match against Escrow Transactions (Purchase Escrow Flow)
            Optional<EscrowTransaction> escrowOpt = escrowTransactionRepository.findByNombaVirtualAccountId(virtualAccountId);
            if (escrowOpt.isEmpty() && orderReference != null && !orderReference.isBlank()) {
                escrowOpt = escrowTransactionRepository.findByNombaOrderReference(orderReference);
            }
            if (escrowOpt.isPresent()) {
                EscrowTransaction escrow = escrowOpt.get();
                int comparison = amount.compareTo(escrow.getAmountHeld());
                String matchedStatus = comparison >= 0 ? "MATCHED" : "UNDERPAID";
                if (comparison >= 0) {
                    escrow.setStatus("HELD");
                    escrow.getProperty().setStatus("UNDER_ESCROW");
                    escrow.setNombaTransactionReference(nombaReference);
                    propertyRepository.save(escrow.getProperty());
                }
                RentPayment payment = RentPayment.builder()
                        .tenancy(null)
                        .amount(amount)
                        .nombaReference(nombaReference)
                        .matchedStatus(matchedStatus)
                        .receivedAt(receivedAt != null ? receivedAt : Instant.now())
                        .build();
                rentPaymentRepository.save(payment);
                escrowTransactionRepository.save(escrow);
                if (comparison >= 0) {
                    createReceiptIfMissing(
                            "House Purchase Escrow Deposit",
                            "PURCHASE",
                            amount,
                            nombaReference,
                            "Nomba payment held for " + escrow.getProperty().getTitle() + ". Funds are pending landlord release.",
                            escrow.getBuyerId()
                    );
                }
                log.info("Reconciliation Engine: Escrow payment [{}] processed as {} for transaction [{}], property [{}]",
                        nombaReference, matchedStatus,
                        escrow.getId(), escrow.getProperty().getId());
                return comparison >= 0 ? "ESCROW_HELD" : "ESCROW_UNDERPAID";
            }

            // 5. Unmatched Reference Flow
            log.warn("Reconciliation Engine: Virtual Account [{}] not matching any active tenancy or escrow. Routing to UNMATCHED queue.", 
                    virtualAccountId);
            
            RentPayment unmatchedPayment = RentPayment.builder()
                    .tenancy(null) // Unmatched
                    .amount(amount)
                    .nombaReference(nombaReference)
                    .matchedStatus("UNMATCHED")
                    .receivedAt(receivedAt != null ? receivedAt : Instant.now())
                    .build();

            rentPaymentRepository.save(unmatchedPayment);
            return "UNMATCHED";

        } finally {
            lockService.releaseLock(nombaReference);
        }
    }

    private LocalDate advanceDueDate(LocalDate currentDate, String frequency) {
        if (frequency == null) {
            return currentDate.plusMonths(1);
        }
        return switch (frequency.toUpperCase()) {
            case "ANNUAL", "YEARLY" -> currentDate.plusYears(1);
            default -> currentDate.plusMonths(1); // Defaults to monthly
        };
    }

    private void createReceiptIfMissing(String title, String category, BigDecimal amount,
                                        String reference, String details, String tenantEmail) {
        if (reference == null || reference.isBlank() || tenantEmail == null || tenantEmail.isBlank()) return;
        if (receiptRepository.findByReference(reference).isEmpty()) {
            receiptRepository.save(Receipt.builder()
                    .title(title)
                    .category(category)
                    .amount(amount)
                    .reference(reference)
                    .details(details)
                    .tenantEmail(tenantEmail)
                    .build());
        }
    }
}
