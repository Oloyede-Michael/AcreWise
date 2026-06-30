package com.autocollect.reflow.controller;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Mono;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.util.Base64;

@RestController
@RequestMapping("/api/webhooks")
@Slf4j
@RequiredArgsConstructor
public class NombaWebhookController {

    private final ObjectMapper objectMapper;

    @Value("${nomba.api.secret-key}")
    private String webhookSecretKey;

    @PostMapping("/nomba")
    public Mono<ResponseEntity<String>> handleNombaWebhook(
            @RequestHeader("nomba-signature") String inboundSignature,
            @RequestHeader("nomba-timestamp") String inboundTimestamp,
            @RequestBody String rawPayload
    ) {
        log.info("Inbound webhook intercepted from Nomba. Verifying cryptographic signature...");

        return Mono.fromCallable(() -> {
            JsonNode root = objectMapper.readTree(rawPayload);
            String eventType = safeGet(root, "event_type");
            String requestId = safeGet(root, "requestId");
            
            JsonNode data = root.get("data");
            JsonNode merchant = data != null ? data.get("merchant") : null;
            JsonNode transaction = data != null ? data.get("transaction") : null;

            String userId = merchant != null ? safeGet(merchant, "userId") : "";
            String walletId = merchant != null ? safeGet(merchant, "walletId") : "";
            String transactionId = transaction != null ? safeGet(transaction, "transactionId") : "";
            String transactionType = transaction != null ? safeGet(transaction, "type") : "";
            String transactionTime = transaction != null ? safeGet(transaction, "time") : "";
            String responseCode = transaction != null ? safeGet(transaction, "responseCode") : "";

            if ("null".equalsIgnoreCase(responseCode)) {
                responseCode = "";
            }

            // Matches exactly the hashing concatenation pattern required by Nomba
            String hashingPayload = String.format(
                    "%s:%s:%s:%s:%s:%s:%s:%s:%s",
                    eventType, requestId, userId, walletId,
                    transactionId, transactionType, transactionTime,
                    responseCode, inboundTimestamp
            );

            Mac sha256HMAC = Mac.getInstance("HmacSHA256");
            SecretKeySpec secretKey = new SecretKeySpec(webhookSecretKey.getBytes(), "HmacSHA256");
            sha256HMAC.init(secretKey);
            byte[] rawHash = sha256HMAC.doFinal(hashingPayload.getBytes());
            String computedSignature = Base64.getEncoder().encodeToString(rawHash);

            if (!computedSignature.equals(inboundSignature)) {
                log.warn("Security Alert: Signature mismatch! Rejecting request.");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid cryptographic signature");
            }

            log.info("Webhook validated successfully! Event type processed: [{}]", eventType);
            return ResponseEntity.ok("Event received and validated");
        }).onErrorResume(err -> {
            log.error("Internal fault processing webhook payload: {}", err.getMessage());
            return Mono.just(ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Processing Fault"));
        });
    }

    private String safeGet(JsonNode node, String fieldName) {
        JsonNode target = node.get(fieldName);
        return (target == null || target.isNull()) ? "" : target.asText();
    }
}