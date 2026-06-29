package com.autocollect.reflow.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.ReactiveRedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.Instant;

@Service
@Slf4j
@RequiredArgsConstructor
public class RedisLockService {

    private final ReactiveRedisTemplate<String, Object> reactiveRedisTemplate;

    /**
     * Obtains an atomic, distributed lock for individual subscription runs to prevent double charging[cite: 1].
     */
    public boolean acquireSubscriptionLock(String subscriptionId, Duration lockDuration) {
        String lockKey = "lock:subscription:" + subscriptionId;
        // Using a non-blocking block fallback for gRPC thread alignment
        Boolean success = reactiveRedisTemplate.opsForValue()
                .setIfAbsent(lockKey, "LOCKED", lockDuration)
                .block();
        return success != null && success;
    }

    /**
     * Releases an active subscription lock execution context[cite: 1].
     */
    public void releaseSubscriptionLock(String subscriptionId) {
        String lockKey = "lock:subscription:" + subscriptionId;
        reactiveRedisTemplate.delete(lockKey).block();
    }

    /**
     * Sliding Window Rate Limiting: Prevents malicious spam of payment endpoints[cite: 1].
     */
/**
     * Sliding Window Rate Limiting: Prevents malicious spam of payment endpoints[cite: 1].
     */
    public boolean isRateLimited(String customerId, int requestCeiling, long timeWindowSeconds) {
        String rateLimitKey = "rate:client:" + customerId;
        long currentTimestamp = Instant.now().getEpochSecond();

        // Push current execution timestamp
        reactiveRedisTemplate.opsForZSet().add(rateLimitKey, String.valueOf(currentTimestamp), currentTimestamp).block();
        long windowStart = currentTimestamp - timeWindowSeconds;
        
        // FIX 2: Construct an explicit bounded Range object for the scores
        org.springframework.data.domain.Range<Double> scoreRange = org.springframework.data.domain.Range.closed(0.0, (double) windowStart);
        reactiveRedisTemplate.opsForZSet().removeRangeByScore(rateLimitKey, scoreRange).block();

        // FIX 3: Change method invocation from .zCard() to reactive .size()
        Long requestCount = reactiveRedisTemplate.opsForZSet().size(rateLimitKey).block();
        reactiveRedisTemplate.expire(rateLimitKey, Duration.ofSeconds(timeWindowSeconds * 2)).block();

        return requestCount != null && requestCount > requestCeiling;
    }
}