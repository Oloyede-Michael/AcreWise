package com.acrewise.land.repository;

import com.acrewise.land.domain.Receipt;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.UUID;
import java.util.List;

@Repository
public interface ReceiptRepository extends JpaRepository<Receipt, UUID> {
    List<Receipt> findByTenantEmailOrderByCreatedAtDesc(String tenantEmail);
}
