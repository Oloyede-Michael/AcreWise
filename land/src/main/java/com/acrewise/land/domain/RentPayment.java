package com.acrewise.land.domain;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "rent_payments")
@Getter 
@Setter 
@NoArgsConstructor 
@AllArgsConstructor 
@Builder
public class RentPayment {

    @Id
    private UUID id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "tenancy_id")
    private Tenancy tenancy;

    @Column(nullable = false, precision = 15, scale = 2)
    private BigDecimal amount;

    @Column(name = "nomba_reference", unique = true, nullable = false)
    private String nombaReference;

    @Column(name = "matched_status", nullable = false)
    private String matchedStatus; // MATCHED, UNDERPAID, OVERPAID, UNMATCHED

    @Column(name = "received_at", nullable = false)
    private Instant receivedAt;

    @Column(name = "created_at")
    private Instant createdAt;

    @PrePersist
    protected void onCreate() {
        if (this.id == null) {
            this.id = UUID.randomUUID();
        }
        if (this.createdAt == null) {
            this.createdAt = Instant.now();
        }
    }
}
