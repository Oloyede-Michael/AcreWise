package com.autocollect.reflow.controller;

import com.autocollect.reflow.domain.Plan;
import com.autocollect.reflow.domain.Subscription;
import com.autocollect.reflow.repository.PlanRepository;
import com.autocollect.reflow.repository.SubscriptionRepository;
import com.autocollect.reflow.service.RedisLockService;
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
public class GraphQLSubscriptionController {

    private final PlanRepository planRepository;
    private final SubscriptionRepository subscriptionRepository;
    private final RedisLockService redisLockService;

    /**
     * Query: Fetches all configured merchant subscription packages.
     */
    @QueryMapping
    public List<Plan> getMerchantPlans() {
        log.info("GraphQL Ingress: Fetching all merchant billing profiles.");
        return planRepository.findAll();
    }

    /**
     * Query: Fetches a standalone subscription state machine record.
     */
    @QueryMapping
    public Subscription getSubscription(@Argument UUID id) {
        log.info("GraphQL Ingress: Retrieving individual subscription ledger: {}", id);
        return subscriptionRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Requested subscription record does not exist."));
    }

    /**
     * Mutation: Creates an intelligent, recurring payment tier[cite: 1].
     */
    @MutationMapping
    public Plan createPlan(@Argument CreatePlanInput input) {
        log.info("GraphQL Ingress: Provisioning a new recurring revenue package: {}", input.getName());
        
        Plan plan = Plan.builder()
                .id(UUID.randomUUID())
                .name(input.getName())
                .amount(BigDecimal.valueOf(input.getAmount()))
                .frequency(input.getFrequency()) // WEEKLY, MONTHLY, ANNUALLY[cite: 1]
                .build();
                
        return planRepository.save(plan);
    }

    /**
     * Mutation: Gracefully pauses automatic billing and suspends the dunning log processing loops[cite: 1].
     */
    @MutationMapping
    public Subscription pauseSubscription(@Argument UUID id) {
        log.info("GraphQL Ingress: Client requested pause option on subscription profile: {}", id);
        
        Subscription subscription = subscriptionRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Subscription target missing."));
                
        subscription.setStatus("PAUSED"); // Enters the non-billable state machine threshold[cite: 1]
        return subscriptionRepository.save(subscription);
    }

    /**
     * Mutation: Re-activates a paused subscription stream[cite: 1].
     */
    @MutationMapping
    public Subscription resumeSubscription(@Argument UUID id) {
        log.info("GraphQL Ingress: Client requested resumption of automated billing on profile: {}", id);
        
        Subscription subscription = subscriptionRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Subscription target missing."));
                
        subscription.setStatus("ACTIVE");
        // Align billing date to today if the original target window was missed while suspended
        if (subscription.getNextBillingDate().isBefore(LocalDate.now())) {
            subscription.setNextBillingDate(LocalDate.now());
        }
        
        return subscriptionRepository.save(subscription);
    }

    /**
     * Mutation: Terminates a subscription profile to stop voluntary churn tracking metrics[cite: 1].
     */
    @MutationMapping
    public Subscription cancelSubscription(@Argument UUID id) {
        log.info("GraphQL Ingress: Explicit cancellation issued for subscription ledger: {}", id);
        
        Subscription subscription = subscriptionRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Subscription target missing."));
                
        subscription.setStatus("CANCELLED"); // Enters termination state[cite: 1]
        return subscriptionRepository.save(subscription);
    }

    // Input transfer object mapping matching the .graphqls file schema layout
    @Data
    public static class CreatePlanInput {
        private String name;
        private Double amount;
        private String frequency;
    }
}