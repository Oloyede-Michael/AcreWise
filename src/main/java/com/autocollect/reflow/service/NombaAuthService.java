package com.autocollect.reflow.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
@Slf4j
@RequiredArgsConstructor
public class NombaAuthService {

    private final WebClient webClient;

    @Value("${nomba.api.client-key}")
    private String clientId;

    @Value("${nomba.api.secret-key}")
    private String clientSecret;

    @Value("${nomba.api.account-id}")
    private String accountId;

    // Fast in-memory atomic map cache to store our active bearer credentials
    private final Map<String, String> tokenCache = new ConcurrentHashMap<>();

    /**
     * Obtains a valid OAuth2 Access Token. 
     * Pulls from memory cache if active, or issues a secure credentials post loop to Nomba.
     */
    public Mono<String> getAccessToken() {
        if (tokenCache.containsKey("access_token")) {
            return Mono.just(tokenCache.get("access_token"));
        }

        log.info("OAuth2 Cycle: Local token expired or absent. Issuing token request to Nomba Sandbox...");

        // Matches exactly the payload schema described in the OpenAPI/Unirest contract definitions
        Map<String, String> authBody = Map.of(
            "grant_type", "client_credentials",
            "client_id", clientId,
            "client_secret", clientSecret
        );

        return webClient.post()
            .uri("/v1/auth/token/issue")
            .header("accountId", accountId) // Pass mandatory parent business identifier header
            .bodyValue(authBody)
            .retrieve()
            .bodyToMono(Map.class)
            .map(response -> {
                Map<String, Object> data = (Map<String, Object>) response.get("data");
                String token = (String) data.get("access_token");
                
                // Cache token in memory for subsequent payment loops
                tokenCache.put("access_token", token);
                log.info("OAuth2 Cycle: Access token obtained and cached successfully.");
                return token;
            })
            .onErrorResume(err -> {
                log.error("OAuth2 Critical Failure: Rejection pulling token boundaries from Nomba: {}", err.getMessage());
                return Mono.error(new SecurityException("Authentication failure on gateway handshake."));
            });
    }

    /**
     * Evicts the current token from the cache if a downstream payment endpoint returns a 401 Unauthorized.
     */
    public void invalidateToken() {
        tokenCache.remove("access_token");
    }
}