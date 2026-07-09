package com.acrewise.land.controller;

import com.acrewise.land.service.NombaAuthService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.util.Map;

@RestController
@RequestMapping("/api/nomba-sandbox")
@RequiredArgsConstructor
@Slf4j
public class NombaSandboxController {

    private final NombaAuthService authService;
    private final WebClient webClient;

    @Value("${nomba.api.account-id}")
    private String accountId;

    @PostMapping("/execute")
    public Mono<ResponseEntity<Map>> execute(@RequestBody Map<String, Object> request) {
        String name = (String) request.get("name");
        String method = (String) request.get("method");
        String url = (String) request.get("url");
        Map<String, Object> body = (Map<String, Object>) request.get("body");

        log.info("Sandbox Execution Request: {} ({} {})", name, method, url);

        // Proxy ALL requests to the real Nomba API. On failure, return an error response.
        return authService.getAccessToken()
            .flatMap(token -> {
                if ("GET".equalsIgnoreCase(method)) {
                    return webClient.get()
                        .uri(url)
                        .header("Authorization", "Bearer " + token)
                        .header("accountId", accountId)
                        .retrieve()
                        .bodyToMono(Map.class)
                        .map(ResponseEntity::ok);
                } else if ("POST".equalsIgnoreCase(method)) {
                    return webClient.post()
                        .uri(url)
                        .header("Authorization", "Bearer " + token)
                        .header("accountId", accountId)
                        .bodyValue(body != null ? body : Map.of())
                        .retrieve()
                        .bodyToMono(Map.class)
                        .map(ResponseEntity::ok);
                } else if ("PUT".equalsIgnoreCase(method)) {
                    return webClient.put()
                        .uri(url)
                        .header("Authorization", "Bearer " + token)
                        .header("accountId", accountId)
                        .bodyValue(body != null ? body : Map.of())
                        .retrieve()
                        .bodyToMono(Map.class)
                        .map(ResponseEntity::ok);
                } else {
                    return webClient.delete()
                        .uri(url)
                        .header("Authorization", "Bearer " + token)
                        .header("accountId", accountId)
                        .retrieve()
                        .bodyToMono(Map.class)
                        .map(ResponseEntity::ok);
                }
            })
            .onErrorResume(err -> {
                String nombaResponse = err.getMessage();
                if (err instanceof org.springframework.web.reactive.function.client.WebClientResponseException wcre) {
                    nombaResponse = wcre.getResponseBodyAsString();
                }
                log.error("Nomba API call failed for {} ({} {}): {} | body: {}", name, method, url, err.getMessage(), nombaResponse);
                return Mono.just(ResponseEntity.ok(Map.of(
                    "code", "99",
                    "description", "Payment gateway unavailable: " + nombaResponse,
                    "rawError", nombaResponse,
                    "data", null
                )));
            });
    }
}
