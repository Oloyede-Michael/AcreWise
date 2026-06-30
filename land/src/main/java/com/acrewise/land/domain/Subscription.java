package com.acrewise.land.domain;

import jakarta.persistence.*;
import lombok.*;
import java.util.UUID;

@Entity
@Table(name = "subscriptions")
@Getter 
@Setter 
@NoArgsConstructor 
@AllArgsConstructor 
@Builder
public class Subscription {

    @Id
    private UUID id;

    @Column(nullable = false)
    private String status; // ACTIVE, PAUSED, CANCELLED

    @PrePersist
    protected void onCreate() {
        if (this.id == null) {
            this.id = UUID.randomUUID();
        }
    }
}
