package com.acrewise.land.domain;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(name = "tenancies")
@Getter 
@Setter 
@NoArgsConstructor 
@AllArgsConstructor 
@Builder
public class Tenancy {

    @Id
    private UUID id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "property_id", nullable = false)
    private Property property;

    @Column(name = "tenant_id", nullable = false)
    private String tenantId;

    @Column(name = "rent_amount", nullable = false, precision = 15, scale = 2)
    private BigDecimal rentAmount;

    @Column(nullable = false)
    private String frequency; // MONTHLY, ANNUAL

    @Column(name = "next_due_date", nullable = false)
    private LocalDate nextDueDate;

    @Column(nullable = false, precision = 15, scale = 2)
    private BigDecimal balance; // Negative = Arrears, Positive = Overpayment Credit

    @Column(name = "nomba_virtual_account_id", unique = true, nullable = false)
    private String nombaVirtualAccountId;

    @Column(name = "nomba_order_reference", unique = true)
    private String nombaOrderReference;

    @Column(name = "created_at")
    private Instant createdAt;

    @PrePersist
    protected void onCreate() {
        if (this.id == null) {
            this.id = UUID.randomUUID();
        }
        if (this.balance == null) {
            this.balance = BigDecimal.ZERO;
        }
        if (this.createdAt == null) {
            this.createdAt = Instant.now();
        }
    }
}
