package com.acrewise.land.repository;

import com.acrewise.land.domain.Tenancy;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface TenancyRepository extends JpaRepository<Tenancy, UUID> {
    Optional<Tenancy> findByNombaVirtualAccountId(String nombaVirtualAccountId);
}
