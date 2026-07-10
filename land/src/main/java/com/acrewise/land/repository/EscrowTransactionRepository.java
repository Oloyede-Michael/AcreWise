package com.acrewise.land.repository;

import com.acrewise.land.domain.EscrowTransaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface EscrowTransactionRepository extends JpaRepository<EscrowTransaction, UUID> {
    Optional<EscrowTransaction> findByNombaVirtualAccountId(String nombaVirtualAccountId);

    Optional<EscrowTransaction> findByNombaOrderReference(String nombaOrderReference);

    boolean existsByProperty_IdAndStatus(UUID propertyId, String status);
}
