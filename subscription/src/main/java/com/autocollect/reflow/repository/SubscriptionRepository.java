package com.autocollect.reflow.repository;

import com.autocollect.reflow.domain.Subscription;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Repository
public interface SubscriptionRepository extends JpaRepository<Subscription, UUID> {
    
    // Fetches subscriptions that match our targeted billing execution windows
    List<Subscription> findByNextBillingDateBeforeAndStatusIn(LocalDate date, List<String> statuses);
}