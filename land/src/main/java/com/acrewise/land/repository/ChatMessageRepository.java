package com.acrewise.land.repository;

import com.acrewise.land.domain.ChatMessage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.UUID;
import java.util.List;

@Repository
public interface ChatMessageRepository extends JpaRepository<ChatMessage, UUID> {
    List<ChatMessage> findByPropertyIdOrderByCreatedAtAsc(UUID propertyId);
}
