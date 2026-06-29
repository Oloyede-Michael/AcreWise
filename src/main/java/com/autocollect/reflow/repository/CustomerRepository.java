package com.autocollect.reflow.repository;

import com.autocollect.reflow.domain.Customer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.UUID;

@Repository
public interface CustomerRepository extends JpaRepository<Customer, UUID> {
    // Allows looking up a subscriber directly via unique email constraints
    java.util.Optional<Customer> findByEmail(String email);
}