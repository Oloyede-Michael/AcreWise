package com.acrewise.land.domain;

import jakarta.persistence.*;
import lombok.*;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "properties")
@Getter 
@Setter 
@NoArgsConstructor 
@AllArgsConstructor 
@Builder
public class Property {

    @Id
    private UUID id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "landlord_id", nullable = false)
    private Landlord landlord;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false)
    private String type; // RENT, SALE

    @Column(nullable = false)
    private String status; // LISTED, UNDER_ESCROW, SOLD, LET

    @Column(name = "verification_status", nullable = false)
    private String verificationStatus; // PENDING, VERIFIED, FLAGGED

    @Column(name = "meter_number")
    private String meterNumber;

    @Column(name = "meter_provider")
    private String meterProvider;

    @Column(name = "area")
    private String area;

    @Column(name = "building_type")
    private String buildingType;

    @Column(name = "price")
    private java.math.BigDecimal price;

    @Column(name = "caretaker_name")
    private String caretakerName;

    @Column(name = "caretaker_email")
    private String caretakerEmail;

    @Column(name = "caretaker_phone")
    private String caretakerPhone;

    @Column(name = "total_units")
    private Integer totalUnits;

    @Column(name = "available_units")
    private Integer availableUnits;

    @Column(name = "created_at")
    private Instant createdAt;

    // ── New marketplace fields ──────────────────────────────────────────────

    /** Optional base64 data URL of the property photo shown on marketplace cards */
    @Column(name = "image_url", columnDefinition = "TEXT")
    private String imageUrl;

    /** First payment / booking amount the tenant must pay upfront */
    @Column(name = "first_payment_amount")
    private java.math.BigDecimal firstPaymentAmount;

    /** Payment frequency selected by landlord: MONTHLY, BIANNUAL, ANNUAL */
    @Column(name = "payment_frequency")
    private String paymentFrequency;

    /**
     * JSON array string of annual rent projections for years 1-5.
     * e.g. "[1200000,1300000,1400000,1500000,1600000]"
     */
    @Column(name = "annual_projections", length = 512)
    private String annualProjections;

    /**
     * Private ownership document URL — never shown publicly.
     * Presence triggers the isAssured flag.
     */
    @Column(name = "ownership_document_url", length = 1024)
    private String ownershipDocumentUrl;

    /**
     * True when the landlord has submitted an ownership document
     * and AcreWise has verified / accepted it.
     */
    @Column(name = "is_assured")
    private Boolean isAssured;

    @PrePersist
    protected void onCreate() {
        if (this.id == null) {
            this.id = UUID.randomUUID();
        }
        if (this.verificationStatus == null) {
            this.verificationStatus = "PENDING";
        }
        if (this.totalUnits == null) {
            this.totalUnits = 1;
        }
        if (this.availableUnits == null) {
            this.availableUnits = 1;
        }
        if (this.createdAt == null) {
            this.createdAt = Instant.now();
        }
    }
}
