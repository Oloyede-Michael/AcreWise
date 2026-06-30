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

    @Column(name = "created_at")
    private Instant createdAt;

    @PrePersist
    protected void onCreate() {
        if (this.id == null) {
            this.id = UUID.randomUUID();
        }
        if (this.verificationStatus == null) {
            this.verificationStatus = "PENDING";
        }
        if (this.createdAt == null) {
            this.createdAt = Instant.now();
        }
    }
}
