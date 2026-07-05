package com.acrewise.land.repository;

import com.acrewise.land.domain.Landlord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.UUID;

@Repository
public interface LandlordRepository extends JpaRepository<Landlord, UUID> {
    java.util.Optional<Landlord> findByEmail(String email);
}
