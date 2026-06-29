package com.autocollect.reflow.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.math.BigDecimal;
import java.util.Map;
import java.util.UUID;

@Service
@Slf4j
@RequiredArgsConstructor
public class NombaIntegrationService {

    private final WebClient webClient;
    private final NombaAuthService authService; // Inject our new OAuth2 manager

    @Value("${nomba.api.account-id}")
    private String accountId;

    public record NombaChargeResponse(boolean success, String message, String code) {}

    public Mono<NombaChargeResponse> chargeTokenizedCard(String cardToken, BigDecimal amount, String customerEmail, String customerId) {
        // FlatMap pulls the dynamic token reactively from the cache/API before building our payment POST request
        return authService.getAccessToken().flatMap(accessToken -> {
            String dynamicOrderRef = UUID.randomUUID().toString();

            Map<String, Object> orderObject = Map.of(
                "orderReference", dynamicOrderRef,
                "customerId", customerId,
                "customerEmail", customerEmail,
                "amount", amount.doubleValue(),
                "currency", "NGN",
                "callbackUrl", "https://autocollect.reflow.africa/merchant/callback"
            );

            Map<String, Object> completeBodyPayload = Map.of(
                "order", orderObject,
                "tokenKey", cardToken
            );

            return webClient.post()
                .uri("/v1/checkout/tokenized-card-payment")
                .header("Authorization", "Bearer " + accessToken) // Pass the valid OAuth2 token securely
                .header("accountId", accountId)
                .bodyValue(completeBodyPayload)
                .retrieve()
                .bodyToMono(Map.class)
                .map(response -> {
                    String responseCode = (String) response.get("code");
                    String description = (String) response.get("description");
                    return new NombaChargeResponse("00".equals(responseCode), description, responseCode);
                })
                .onErrorResume(error -> {
                    log.error("Nomba Card Payment Exception: {}", error.getMessage());
                    return Mono.just(new NombaChargeResponse(false, "TRANSACTION_FAILED", "500"));
                });
        });
    }
}