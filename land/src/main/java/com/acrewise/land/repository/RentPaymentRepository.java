package com.acrewise.land.repository;

import com.acrewise.land.domain.RentPayment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.UUID;

@Repository
public interface RentPaymentRepository extends JpaRepository<RentPayment, UUID> {
    List<RentPayment> findByMatchedStatus(String matchedStatus);
    boolean existsByNombaReference(String nombaReference);
}
