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

    @Value("${nomba.api.sub-account-id:}")
    private String subAccountId;

    @PostMapping("/execute")
    public Mono<ResponseEntity<Map>> execute(@RequestBody Map<String, Object> request) {
        String name = (String) request.get("name");
        String method = (String) request.get("method");
        String url = (String) request.get("url");
        Map<String, Object> body = (Map<String, Object>) request.get("body");

        if (subAccountId != null && !subAccountId.isBlank()) {
            if ("/v1/accounts/virtual".equals(url) && name != null && name.contains("virtual account")) {
                url = "/v1/accounts/virtual/" + subAccountId;
            } else if ("/v1/terminals".equals(url) && name != null && name.contains("terminals")) {
                url = "/v1/terminals/sub-account/" + subAccountId;
            } else if ("/v2/transfers/bank".equals(url) && name != null && name.contains("sub account")) {
                url = "/v2/transfers/bank/" + subAccountId;
            } else if (url != null && url.startsWith("/v1/transactions/accounts/single")) {
                url = "/v1/transactions/accounts/" + subAccountId + "/single"
                        + (url.contains("?") ? url.substring(url.indexOf('?')) : "");
            }
        }

        // Checkout credits the sub-account from the order body while the header
        // must remain the parent account. Keep this server-side so the frontend
        // never needs to expose or duplicate deployment configuration.
        if (body != null && "/v1/checkout/order".equals(url)) {
            Object orderValue = body.get("order");
            if (orderValue instanceof Map<?, ?> rawOrder) {
                Map<String, Object> order = (Map<String, Object>) rawOrder;
                if (!order.containsKey("accountId") && subAccountId != null && !subAccountId.isBlank()) {
                    order.put("accountId", subAccountId);
                }
            }
        }

        log.info("Nomba API Request: {} ({} {})", name, method, url);
        final String requestName = name;
        final String requestMethod = method;
        final String requestUrl = url;
        final Map<String, Object> requestBody = body;

        // Proxy ALL requests to the real Nomba API. On failure, return an error response.
        return authService.getAccessToken()
            .flatMap(token -> {
                if ("GET".equalsIgnoreCase(requestMethod)) {
                    return webClient.get()
                        .uri(requestUrl)
                        .header("Authorization", "Bearer " + token)
                        .header("accountId", accountId)
                        .retrieve()
                        .bodyToMono(Map.class)
                        .map(ResponseEntity::ok);
                } else if ("POST".equalsIgnoreCase(requestMethod)) {
                    return webClient.post()
                        .uri(requestUrl)
                        .header("Authorization", "Bearer " + token)
                        .header("accountId", accountId)
                        .bodyValue(requestBody != null ? requestBody : Map.of())
                        .retrieve()
                        .bodyToMono(Map.class)
                        .map(ResponseEntity::ok);
                } else if ("PUT".equalsIgnoreCase(requestMethod)) {
                    return webClient.put()
                        .uri(requestUrl)
                        .header("Authorization", "Bearer " + token)
                        .header("accountId", accountId)
                        .bodyValue(requestBody != null ? requestBody : Map.of())
                        .retrieve()
                        .bodyToMono(Map.class)
                        .map(ResponseEntity::ok);
                } else {
                    return webClient.delete()
                        .uri(requestUrl)
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
                log.error("Nomba API call failed for {} ({} {}): {} | body: {}", requestName, requestMethod, requestUrl, err.getMessage(), nombaResponse);
                return Mono.just(ResponseEntity.ok(Map.of(
                    "code", "99",
                    "description", "Payment gateway unavailable: " + nombaResponse,
                    "rawError", nombaResponse,
                    "data", null
                )));
            });
    }
}
