package com.autocollect.reflow.repository;

import com.autocollect.reflow.domain.PaymentMethod;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.UUID;

@Repository
public interface PaymentMethodRepository extends JpaRepository<PaymentMethod, UUID> {
    
    // Sorts by isPrimary DESC so the primary card is always index 0, followed by backup options
    List<PaymentMethod> findByCustomerIdOrderByIsPrimaryDesc(UUID customerId);
}