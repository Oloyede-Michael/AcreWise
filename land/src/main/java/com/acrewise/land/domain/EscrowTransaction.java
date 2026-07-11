package com.acrewise.land.domain;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "escrow_transactions")
@Getter 
@Setter 
@NoArgsConstructor 
@AllArgsConstructor 
@Builder
public class EscrowTransaction {

    @Id
    private UUID id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "property_id", nullable = false)
    private Property property;

    @Column(name = "buyer_id", nullable = false)
    private String buyerId;

    @Column(name = "amount_held", nullable = false, precision = 15, scale = 2)
    private BigDecimal amountHeld;

    @Column(nullable = false)
    private String status; // HELD, RELEASED, REFUNDED

    @Column(name = "nomba_virtual_account_id", nullable = false)
    private String nombaVirtualAccountId;

    @Column(name = "nomba_order_reference", unique = true)
    private String nombaOrderReference;

    @Column(name = "nomba_transaction_reference")
    private String nombaTransactionReference;

    @Column(name = "nomba_payout_reference")
    private String nombaPayoutReference;

    @Column(name = "payout_error", length = 2000)
    private String payoutError;

    @Column(name = "payment_sync_error", length = 2000)
    private String paymentSyncError;

    @Column(name = "released_at")
    private Instant releasedAt;

    @Column(name = "created_at")
    private Instant createdAt;

    @PrePersist
    protected void onCreate() {
        if (this.id == null) {
            this.id = UUID.randomUUID();
        }
        if (this.status == null) {
            this.status = "HELD";
        }
        if (this.createdAt == null) {
            this.createdAt = Instant.now();
        }
    }
}
