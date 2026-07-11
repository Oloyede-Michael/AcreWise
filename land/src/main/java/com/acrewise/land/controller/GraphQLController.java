package com.acrewise.land.controller;

import com.acrewise.land.domain.*;
import com.acrewise.land.repository.*;
import com.acrewise.land.service.NombaAuthService;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.graphql.data.method.annotation.Argument;
import org.springframework.graphql.data.method.annotation.MutationMapping;
import org.springframework.graphql.data.method.annotation.QueryMapping;
import org.springframework.stereotype.Controller;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import java.util.Map;

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
    private final NombaAuthService nombaAuthService;
    private final WebClient webClient;

    @Value("${nomba.api.account-id}")
    private String nombaAccountId;

    @Value("${nomba.api.sub-account-id:}")
    private String nombaSubAccountId;

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
    public Landlord updateLandlordPayoutDetails(
            @Argument String email,
            @Argument String bankAccountNumber,
            @Argument String bankCode
    ) {
        Landlord landlord = landlordRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("Landlord not found."));
        landlord.setBankAccountNumber(bankAccountNumber);
        landlord.setBankCode(bankCode);
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
    @Transactional
    public Tenancy createTenancy(
            @Argument UUID propertyId,
            @Argument String tenantId,
            @Argument Double rentAmount,
            @Argument String frequency,
            @Argument String nextDueDate,
            @Argument String nombaVirtualAccountId,
            @Argument String nombaOrderReference
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
                .nombaOrderReference(nombaOrderReference)
                .build();

        if (!"RENT".equalsIgnoreCase(property.getType())) {
            throw new IllegalArgumentException("Lease agreements can only be created for RENT properties.");
        }
        if (tenancyRepository.existsByProperty_IdAndTenantId(propertyId, tenantId)) {
            throw new IllegalStateException("This tenant already has a lease for the property.");
        }
        int availableUnits = property.getAvailableUnits() != null ? property.getAvailableUnits() : 1;
        if (availableUnits <= 0) {
            throw new IllegalStateException("Property has no available units.");
        }
        property.setAvailableUnits(availableUnits - 1);
        if (property.getAvailableUnits() == 0) {
            property.setStatus("LET");
        }
        propertyRepository.save(property);
        return tenancyRepository.save(tenancy);
    }

    @MutationMapping
    @Transactional
    public EscrowTransaction createEscrowTransaction(
            @Argument UUID propertyId,
            @Argument String buyerId,
            @Argument Double amountHeld,
            @Argument String nombaVirtualAccountId,
            @Argument String nombaOrderReference
    ) {
        log.info("GraphQL Ingress: Creating escrow transaction for property: {}", propertyId);
        Property property = propertyRepository.findById(propertyId)
                .orElseThrow(() -> new IllegalArgumentException("Property not found."));

        EscrowTransaction escrow = EscrowTransaction.builder()
                .property(property)
                .buyerId(buyerId)
                .amountHeld(BigDecimal.valueOf(amountHeld))
                .nombaVirtualAccountId(nombaVirtualAccountId)
                .nombaOrderReference(nombaOrderReference)
                .status("PENDING_PAYMENT")
                .build();
        if (!"SALE".equalsIgnoreCase(property.getType())) {
            throw new IllegalArgumentException("Purchase escrow can only be created for SALE properties.");
        }
        if (escrowTransactionRepository.existsByProperty_IdAndStatus(propertyId, "PENDING_PAYMENT")
                || escrowTransactionRepository.existsByProperty_IdAndStatus(propertyId, "HELD")) {
            throw new IllegalStateException("This property already has an active purchase escrow.");
        }
        if ((property.getAvailableUnits() != null ? property.getAvailableUnits() : 1) <= 0) {
            throw new IllegalStateException("Property has no available units.");
        }
        property.setStatus("UNDER_ESCROW");
        int availableUnits = property.getAvailableUnits() != null ? property.getAvailableUnits() : 1;
        property.setAvailableUnits(Math.max(0, availableUnits - 1));
        propertyRepository.save(property);
        return escrowTransactionRepository.save(escrow);
    }

    @MutationMapping
    public Tenancy linkTenancyOrder(@Argument UUID tenancyId, @Argument String orderReference) {
        Tenancy tenancy = tenancyRepository.findById(tenancyId)
                .orElseThrow(() -> new IllegalArgumentException("Tenancy not found."));
        tenancy.setNombaOrderReference(orderReference);
        return tenancyRepository.save(tenancy);
    }

    @MutationMapping
    public Tenancy claimTenancy(@Argument UUID tenancyId, @Argument String tenantId) {
        Tenancy tenancy = tenancyRepository.findById(tenancyId)
                .orElseThrow(() -> new IllegalArgumentException("Tenancy not found."));
        tenancy.setTenantId(tenantId);
        return tenancyRepository.save(tenancy);
    }

    @MutationMapping
    @Transactional
    public EscrowTransaction releaseEscrow(@Argument UUID id) {
        EscrowTransaction escrow = escrowTransactionRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Escrow transaction not found."));
        if (!"HELD".equalsIgnoreCase(escrow.getStatus())) {
            throw new IllegalStateException("Escrow can only be released after payment is held. Current status: " + escrow.getStatus());
        }
        Landlord landlord = escrow.getProperty().getLandlord();
        if (landlord.getBankAccountNumber() == null || landlord.getBankCode() == null) {
            throw new IllegalStateException("Landlord payout bank details are required before release.");
        }

        String transferReference = "acrewise_escrow_" + UUID.randomUUID();
        Map<String, Object> payload = Map.of(
                "amount", escrow.getAmountHeld().doubleValue(),
                "accountNumber", landlord.getBankAccountNumber(),
                "accountName", landlord.getName(),
                "bankCode", landlord.getBankCode(),
                "merchantTxRef", transferReference,
                "senderName", "AcreWise Escrow",
                "narration", "Escrow release to landlord"
        );
        Map response = nombaAuthService.getAccessToken()
                .flatMap(token -> webClient.post()
                        .uri(nombaSubAccountId == null || nombaSubAccountId.isBlank()
                                ? "/v2/transfers/bank"
                                : "/v2/transfers/bank/" + nombaSubAccountId)
                        .header("Authorization", "Bearer " + token)
                        .header("accountId", nombaAccountId)
                        .bodyValue(payload)
                        .retrieve()
                        .bodyToMono(Map.class))
                .block();
        if (!isSuccessfulNombaTransfer(response)) {
            throw new IllegalStateException("Nomba escrow release transfer was not successful.");
        }
        escrow.setStatus("RELEASED");
        escrow.setReleasedAt(java.time.Instant.now());
        escrow.setNombaTransactionReference(transferReference);
        escrow.getProperty().setStatus("SOLD");
        propertyRepository.save(escrow.getProperty());
        return escrowTransactionRepository.save(escrow);
    }

    @MutationMapping
    @Transactional
    public EscrowTransaction rejectEscrow(@Argument UUID id) {
        EscrowTransaction escrow = escrowTransactionRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Escrow transaction not found."));
        if ("HELD".equalsIgnoreCase(escrow.getStatus())) {
            if (escrow.getNombaTransactionReference() == null) {
                throw new IllegalStateException("Payment reference is missing; escrow cannot be refunded safely.");
            }
            Map<String, Object> payload = Map.of(
                    "transactionId", escrow.getNombaTransactionReference(),
                    "amount", escrow.getAmountHeld().doubleValue()
            );
            Map response = nombaAuthService.getAccessToken()
                    .flatMap(token -> webClient.post()
                            .uri("/v1/checkout/refund")
                            .header("Authorization", "Bearer " + token)
                            .header("accountId", nombaAccountId)
                            .bodyValue(payload)
                            .retrieve()
                            .bodyToMono(Map.class))
                    .block();
            if (response == null || !"00".equals(String.valueOf(response.get("code")))) {
                throw new IllegalStateException("Nomba escrow refund was not successful.");
            }
        }
        if (!"PENDING_PAYMENT".equalsIgnoreCase(escrow.getStatus()) && !"HELD".equalsIgnoreCase(escrow.getStatus())) {
            throw new IllegalStateException("Escrow cannot be rejected from status: " + escrow.getStatus());
        }
        escrow.setStatus("REFUNDED");
        escrow.getProperty().setStatus("LISTED");
        int units = escrow.getProperty().getAvailableUnits() != null ? escrow.getProperty().getAvailableUnits() : 0;
        escrow.getProperty().setAvailableUnits(units + 1);
        propertyRepository.save(escrow.getProperty());
        return escrowTransactionRepository.save(escrow);
    }

    @MutationMapping
    @Transactional
    public EscrowTransaction synchronizeEscrowPayment(@Argument UUID id) {
        EscrowTransaction escrow = escrowTransactionRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Escrow transaction not found."));
        if ("HELD".equalsIgnoreCase(escrow.getStatus())) {
            return escrow;
        }
        if (!"PENDING_PAYMENT".equalsIgnoreCase(escrow.getStatus())) {
            throw new IllegalStateException("Only pending escrows can be synchronized.");
        }
        if (escrow.getNombaOrderReference() == null || escrow.getNombaOrderReference().isBlank()) {
            throw new IllegalStateException("Nomba order reference is missing for this escrow.");
        }

        Map response = nombaAuthService.getAccessToken()
                .flatMap(token -> webClient.get()
                        .uri("/v1/checkout/order/" + escrow.getNombaOrderReference())
                        .header("Authorization", "Bearer " + token)
                        .header("accountId", nombaAccountId)
                        .retrieve()
                        .bodyToMono(Map.class))
                .block();
        Map data = response != null && response.get("data") instanceof Map
                ? (Map) response.get("data") : response;
        Map order = data != null && data.get("order") instanceof Map
                ? (Map) data.get("order") : data;
        String status = firstString(data, "status", "paymentStatus", "orderStatus", "paymentState", "state");
        if (status == null && order != null) {
            status = firstString(order, "status", "paymentStatus", "orderStatus", "paymentState", "state");
        }
        if (status == null && data != null && data.get("transaction") instanceof Map) {
            status = firstString((Map) data.get("transaction"), "status", "paymentStatus", "state");
        }
        if (!isPaidStatus(status)) {
            throw new IllegalStateException("Nomba order is not confirmed as paid. Current status: " + status);
        }

        String transactionReference = firstString(data, "transactionId", "transactionReference");
        if (transactionReference == null && order != null) {
            transactionReference = firstString(order, "transactionId", "transactionReference");
        }
        if (transactionReference == null && data != null && data.get("transaction") instanceof Map) {
            transactionReference = firstString((Map) data.get("transaction"), "transactionId", "transactionReference", "id");
        }
        escrow.setNombaTransactionReference(transactionReference);
        escrow.setStatus("HELD");
        escrow.getProperty().setStatus("UNDER_ESCROW");
        propertyRepository.save(escrow.getProperty());
        return escrowTransactionRepository.save(escrow);
    }

    private boolean isPaidStatus(String status) {
        if (status == null) return false;
        String normalized = status.trim().toUpperCase();
        return List.of("PAID", "SUCCESS", "SUCCESSFUL", "COMPLETED", "SETTLED", "CAPTURED").contains(normalized);
    }

    private String firstString(Map values, String... keys) {
        if (values == null) return null;
        for (String key : keys) {
            Object value = values.get(key);
            if (value != null && !String.valueOf(value).isBlank()) return String.valueOf(value);
        }
        return null;
    }

    private boolean isSuccessfulNombaTransfer(Map response) {
        if (response == null) return false;
        String code = String.valueOf(response.get("code"));
        if ("00".equals(code) || "200".equals(code)) return true;
        Object data = response.get("data");
        if (data instanceof Map<?, ?> dataMap) {
            String status = String.valueOf(dataMap.get("status"));
            return "SUCCESS".equalsIgnoreCase(status);
        }
        return false;
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
        return receiptRepository.findByTenantEmailIgnoreCaseOrderByCreatedAtDesc(tenantEmail);
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
        if (price == null || price <= 0) {
            throw new IllegalArgumentException("Property price must be greater than zero.");
        }
        if (firstPaymentAmount != null && (firstPaymentAmount <= 0 || firstPaymentAmount > price)) {
            throw new IllegalArgumentException("First payment must be greater than zero and cannot exceed the property price.");
        }
        if (paymentFrequency == null || paymentFrequency.isBlank()) {
            throw new IllegalArgumentException("Payment frequency is required for a rental property.");
        }

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
