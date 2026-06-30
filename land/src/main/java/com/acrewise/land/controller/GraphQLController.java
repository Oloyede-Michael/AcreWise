package com.acrewise.land.controller;

import com.acrewise.land.domain.*;
import com.acrewise.land.repository.*;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.graphql.data.method.annotation.Argument;
import org.springframework.graphql.data.method.annotation.MutationMapping;
import org.springframework.graphql.data.method.annotation.QueryMapping;
import org.springframework.stereotype.Controller;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Controller
@Slf4j
@RequiredArgsConstructor
public class GraphQLController {

    private final PlanRepository planRepository;
    private final SubscriptionRepository subscriptionRepository;
    private final RentPaymentRepository rentPaymentRepository;
    private final LandlordRepository landlordRepository;
    private final PropertyRepository propertyRepository;
    private final TenancyRepository tenancyRepository;
    private final EscrowTransactionRepository escrowTransactionRepository;

    // --- Component D Queries ---

    @QueryMapping
    public List<Plan> getMerchantPlans() {
        log.info("GraphQL Ingress: Fetching all merchant plans.");
        return planRepository.findAll();
    }

    @QueryMapping
    public Subscription getSubscription(@Argument UUID id) {
        log.info("GraphQL Ingress: Retrieving individual subscription: {}", id);
        return subscriptionRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Requested subscription does not exist."));
    }

    @QueryMapping
    public List<RentPayment> getUnmatchedQueue() {
        log.info("GraphQL Ingress: Retrieving all unmatched transactions.");
        return rentPaymentRepository.findByMatchedStatus("UNMATCHED");
    }

    // --- AcreWise Queries ---

    @QueryMapping
    public List<Property> getProperties() {
        log.info("GraphQL Ingress: Fetching all properties.");
        return propertyRepository.findAll();
    }

    @QueryMapping
    public Property getProperty(@Argument UUID id) {
        log.info("GraphQL Ingress: Retrieving property: {}", id);
        return propertyRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Property not found."));
    }

    @QueryMapping
    public List<Tenancy> getTenancies() {
        log.info("GraphQL Ingress: Fetching all tenancies.");
        return tenancyRepository.findAll();
    }

    @QueryMapping
    public Tenancy getTenancy(@Argument UUID id) {
        log.info("GraphQL Ingress: Retrieving tenancy: {}", id);
        return tenancyRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Tenancy not found."));
    }

    @QueryMapping
    public List<EscrowTransaction> getEscrowTransactions() {
        log.info("GraphQL Ingress: Fetching all escrow transactions.");
        return escrowTransactionRepository.findAll();
    }

    // --- Component D Mutations ---

    @MutationMapping
    public Subscription pauseSubscription(@Argument UUID id) {
        log.info("GraphQL Ingress: Pausing subscription: {}", id);
        Subscription subscription = subscriptionRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Subscription not found."));
        subscription.setStatus("PAUSED");
        return subscriptionRepository.save(subscription);
    }

    @MutationMapping
    public Subscription resumeSubscription(@Argument UUID id) {
        log.info("GraphQL Ingress: Resuming subscription: {}", id);
        Subscription subscription = subscriptionRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Subscription not found."));
        subscription.setStatus("ACTIVE");
        return subscriptionRepository.save(subscription);
    }

    @MutationMapping
    public Plan createPlan(@Argument CreatePlanInput input) {
        log.info("GraphQL Ingress: Creating plan: {}", input.getName());
        Plan plan = Plan.builder()
                .name(input.getName())
                .amount(BigDecimal.valueOf(input.getAmount()))
                .frequency(input.getFrequency())
                .build();
        return planRepository.save(plan);
    }

    // --- AcreWise Mutations ---

    @MutationMapping
    public Landlord createLandlord(@Argument String name, @Argument String email, @Argument String phone) {
        log.info("GraphQL Ingress: Registering landlord: {}", name);
        Landlord landlord = Landlord.builder()
                .name(name)
                .email(email)
                .phone(phone)
                .build();
        return landlordRepository.save(landlord);
    }

    @MutationMapping
    public Property createProperty(
            @Argument UUID landlordId,
            @Argument String title,
            @Argument String type,
            @Argument String status
    ) {
        log.info("GraphQL Ingress: Creating property: {}", title);
        Landlord landlord = landlordRepository.findById(landlordId)
                .orElseThrow(() -> new IllegalArgumentException("Landlord not found."));

        Property property = Property.builder()
                .landlord(landlord)
                .title(title)
                .type(type)
                .status(status)
                .verificationStatus("PENDING")
                .build();

        return propertyRepository.save(property);
    }

    @MutationMapping
    public Tenancy createTenancy(
            @Argument UUID propertyId,
            @Argument UUID tenantId,
            @Argument Double rentAmount,
            @Argument String frequency,
            @Argument String nextDueDate,
            @Argument String nombaVirtualAccountId
    ) {
        log.info("GraphQL Ingress: Creating tenancy for property: {}", propertyId);
        Property property = propertyRepository.findById(propertyId)
                .orElseThrow(() -> new IllegalArgumentException("Property not found."));

        Tenancy tenancy = Tenancy.builder()
                .property(property)
                .tenantId(tenantId)
                .rentAmount(BigDecimal.valueOf(rentAmount))
                .frequency(frequency)
                .nextDueDate(LocalDate.parse(nextDueDate))
                .balance(BigDecimal.ZERO)
                .nombaVirtualAccountId(nombaVirtualAccountId)
                .build();

        return tenancyRepository.save(tenancy);
    }

    @MutationMapping
    public EscrowTransaction createEscrowTransaction(
            @Argument UUID propertyId,
            @Argument UUID buyerId,
            @Argument Double amountHeld,
            @Argument String nombaVirtualAccountId
    ) {
        log.info("GraphQL Ingress: Creating escrow transaction for property: {}", propertyId);
        Property property = propertyRepository.findById(propertyId)
                .orElseThrow(() -> new IllegalArgumentException("Property not found."));

        EscrowTransaction escrow = EscrowTransaction.builder()
                .property(property)
                .buyerId(buyerId)
                .amountHeld(BigDecimal.valueOf(amountHeld))
                .nombaVirtualAccountId(nombaVirtualAccountId)
                .status("HELD")
                .build();

        return escrowTransactionRepository.save(escrow);
    }

    @Data
    public static class CreatePlanInput {
        private String name;
        private Double amount;
        private String frequency;
    }
}
