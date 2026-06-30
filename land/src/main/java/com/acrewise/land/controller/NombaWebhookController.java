package com.acrewise.land.controller;

import com.acrewise.land.service.ReconciliationEngine;
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
import java.math.BigDecimal;
import java.time.Instant;
import java.util.Base64;

@RestController
@RequestMapping("/api/webhooks")
@Slf4j
@RequiredArgsConstructor
public class NombaWebhookController {

    private final ObjectMapper objectMapper;
    private final ReconciliationEngine reconciliationEngine;

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
                return new WebhookContext(false, null, null, null, null, "Invalid cryptographic signature");
            }

            // Extract the virtual account ID, transaction amount, and timestamp
            String virtualAccountId = "";
            if (data != null) {
                if (data.has("virtualAccount") && data.get("virtualAccount").has("id")) {
                    virtualAccountId = data.get("virtualAccount").get("id").asText();
                } else if (data.has("virtualAccountId")) {
                    virtualAccountId = data.get("virtualAccountId").asText();
                } else if (transaction != null && transaction.has("virtualAccountId")) {
                    virtualAccountId = transaction.get("virtualAccountId").asText();
                } else if (transaction != null && transaction.has("accountNumber")) {
                    virtualAccountId = transaction.get("accountNumber").asText();
                }
            }

            BigDecimal amount = BigDecimal.ZERO;
            if (transaction != null && transaction.has("amount")) {
                amount = new BigDecimal(transaction.get("amount").asText());
            }

            Instant receivedAt = Instant.now();
            if (transaction != null && transaction.has("time")) {
                try {
                    receivedAt = Instant.parse(transaction.get("time").asText());
                } catch (Exception ex) {
                    log.warn("Could not parse transaction time, using current time: {}", ex.getMessage());
                }
            }

            log.info("Webhook validated successfully! Event type processed: [{}], VirtualAccount: [{}], Reference: [{}]", 
                    eventType, virtualAccountId, transactionId);
            
            return new WebhookContext(true, virtualAccountId, amount, transactionId, receivedAt, "OK");
        }).flatMap(ctx -> {
            if (!ctx.isValid) {
                return Mono.just(ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(ctx.message));
            }
            
            // Pass it to the reconciliation engine
            return reconciliationEngine.processWebhookPayment(ctx.virtualAccountId, ctx.amount, ctx.nombaReference, ctx.receivedAt)
                    .map(status -> ResponseEntity.ok("Reconciliation Status: " + status));
        }).onErrorResume(err -> {
            log.error("Internal fault processing webhook payload: {}", err.getMessage());
            return Mono.just(ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Processing Fault"));
        });
    }

    private String safeGet(JsonNode node, String fieldName) {
        JsonNode target = node.get(fieldName);
        return (target == null || target.isNull()) ? "" : target.asText();
    }

    private record WebhookContext(
            boolean isValid,
            String virtualAccountId,
            BigDecimal amount,
            String nombaReference,
            Instant receivedAt,
            String message
    ) {}
}
