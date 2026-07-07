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
    private final UserProfileRepository userProfileRepository;
    private final ChatMessageRepository chatMessageRepository;
    private final ReceiptRepository receiptRepository;

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
        return landlordRepository.findByEmail(email)
                .orElseGet(() -> {
                    Landlord landlord = Landlord.builder()
                            .name(name)
                            .email(email)
                            .phone(phone)
                            .build();
                    return landlordRepository.save(landlord);
                });
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
            @Argument String tenantId,
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
            @Argument String buyerId,
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

    @MutationMapping
    public Property linkPropertyMeter(
            @Argument UUID propertyId,
            @Argument String meterNumber,
            @Argument String meterProvider
    ) {
        log.info("GraphQL Ingress: Linking meter {} ({}) to property {}", meterNumber, meterProvider, propertyId);
        Property property = propertyRepository.findById(propertyId)
                .orElseThrow(() -> new IllegalArgumentException("Property not found."));

        property.setMeterNumber(meterNumber);
        property.setMeterProvider(meterProvider);

        return propertyRepository.save(property);
    }

    @MutationMapping
    public Property updatePropertyStatus(
            @Argument UUID propertyId,
            @Argument String status
    ) {
        log.info("GraphQL Ingress: Updating property {} status to {}", propertyId, status);
        Property property = propertyRepository.findById(propertyId)
                .orElseThrow(() -> new IllegalArgumentException("Property not found."));

        property.setStatus(status);

        return propertyRepository.save(property);
    }

    // --- User Profile, Chat Messages & Receipts Resolvers ---

    @QueryMapping
    public UserProfile getUserProfile(@Argument String email) {
        return userProfileRepository.findByEmail(email).orElse(null);
    }

    @QueryMapping
    public List<ChatMessage> getChatMessages(@Argument UUID propertyId) {
        return chatMessageRepository.findByPropertyIdOrderByCreatedAtAsc(propertyId);
    }

    @QueryMapping
    public List<Receipt> getReceipts(@Argument String tenantEmail) {
        return receiptRepository.findByTenantEmailOrderByCreatedAtDesc(tenantEmail);
    }

    @MutationMapping
    public UserProfile registerUserProfile(@Argument String email, @Argument String name, @Argument String role) {
        log.info("GraphQL Ingress: Registering user profile for: {} with role: {}", email, role);
        return userProfileRepository.findByEmail(email)
                .orElseGet(() -> {
                    UserProfile profile = UserProfile.builder()
                            .email(email)
                            .role(role != null ? role.toUpperCase() : "TENANT")
                            .name(name != null ? name : email.split("@")[0])
                            .build();
                    return userProfileRepository.save(profile);
                });
    }

    @MutationMapping
    public UserProfile upgradeToLandlord(@Argument String email) {
        log.info("GraphQL Ingress: Upgrading user profile to Landlord: {}", email);
        UserProfile profile = userProfileRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("User profile not found."));
        profile.setRole("LANDLORD");
        return userProfileRepository.save(profile);
    }

    @MutationMapping
    public Property listProperty(
            @Argument UUID landlordId,
            @Argument String title,
            @Argument String type,
            @Argument String status,
            @Argument String area,
            @Argument String buildingType,
            @Argument Double price,
            @Argument Integer totalUnits,
            @Argument String imageUrl,
            @Argument Double firstPaymentAmount,
            @Argument String paymentFrequency,
            @Argument String annualProjections,
            @Argument String ownershipDocumentUrl
    ) {
        log.info("GraphQL Ingress: Listing property {} for landlord {}", title, landlordId);
        Landlord landlord = landlordRepository.findById(landlordId)
                .orElseThrow(() -> new IllegalArgumentException("Landlord not found."));

        int units = totalUnits != null ? totalUnits : 1;
        boolean assured = ownershipDocumentUrl != null && !ownershipDocumentUrl.isBlank();

        Property property = Property.builder()
                .landlord(landlord)
                .title(title)
                .type(type)
                .status(status)
                .verificationStatus("PENDING")
                .area(area)
                .buildingType(buildingType)
                .price(BigDecimal.valueOf(price))
                .totalUnits(units)
                .availableUnits(units)
                .imageUrl(imageUrl)
                .firstPaymentAmount(firstPaymentAmount != null ? BigDecimal.valueOf(firstPaymentAmount) : null)
                .paymentFrequency(paymentFrequency)
                .annualProjections(annualProjections)
                .ownershipDocumentUrl(ownershipDocumentUrl)
                .isAssured(assured)
                .build();

        return propertyRepository.save(property);
    }

    @MutationMapping
    public Property decrementPropertyUnits(@Argument UUID propertyId) {
        log.info("GraphQL Ingress: Decrementing available units for property {}", propertyId);
        Property property = propertyRepository.findById(propertyId)
                .orElseThrow(() -> new IllegalArgumentException("Property not found."));

        int currentAvailable = property.getAvailableUnits() != null ? property.getAvailableUnits() : 1;
        if (currentAvailable > 0) {
            property.setAvailableUnits(currentAvailable - 1);
        }
        return propertyRepository.save(property);
    }

    @MutationMapping
    public Property assignPropertyCaretaker(
            @Argument UUID propertyId,
            @Argument String name,
            @Argument String email,
            @Argument String phone
    ) {
        log.info("GraphQL Ingress: Assigning caretaker {} to property {}", name, propertyId);
        Property property = propertyRepository.findById(propertyId)
                .orElseThrow(() -> new IllegalArgumentException("Property not found."));

        property.setCaretakerName(name);
        property.setCaretakerEmail(email);
        property.setCaretakerPhone(phone);

        return propertyRepository.save(property);
    }

    @MutationMapping
    public ChatMessage sendChatMessage(
            @Argument UUID propertyId,
            @Argument String senderEmail,
            @Argument String senderRole,
            @Argument String message
    ) {
        log.info("GraphQL Ingress: Chat message sent by {} to property {}", senderEmail, propertyId);
        ChatMessage msg = ChatMessage.builder()
                .propertyId(propertyId)
                .senderEmail(senderEmail)
                .senderRole(senderRole)
                .message(message)
                .build();
        return chatMessageRepository.save(msg);
    }

    @MutationMapping
    public Receipt createReceipt(
            @Argument String title,
            @Argument String category,
            @Argument Double amount,
            @Argument String reference,
            @Argument String details,
            @Argument String tenantEmail
    ) {
        log.info("GraphQL Ingress: Registering receipt for {} under category {}", tenantEmail, category);
        
        java.util.Optional<Receipt> existing = receiptRepository.findAll().stream()
                .filter(r -> reference.equals(r.getReference()))
                .findFirst();
        if (existing.isPresent()) {
            return existing.get();
        }

        Receipt receipt = Receipt.builder()
                .title(title)
                .category(category)
                .amount(BigDecimal.valueOf(amount))
                .reference(reference)
                .details(details)
                .tenantEmail(tenantEmail)
                .build();
        return receiptRepository.save(receipt);
    }

    @Data
    public static class CreatePlanInput {
        private String name;
        private Double amount;
        private String frequency;
    }
}
