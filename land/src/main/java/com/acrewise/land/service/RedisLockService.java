package com.acrewise.land.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.ReactiveRedisTemplate;
import org.springframework.stereotype.Service;
import java.time.Duration;

@Service
@Slf4j
@RequiredArgsConstructor
public class RedisLockService {

    private final ReactiveRedisTemplate<String, Object> reactiveRedisTemplate;

    /**
     * Obtains an atomic, distributed lock for individual transaction or operation runs.
     */
    public boolean acquireLock(String lockKey, Duration lockDuration) {
        String fullKey = "lock:acrewise:" + lockKey;
        Boolean success = reactiveRedisTemplate.opsForValue()
                .setIfAbsent(fullKey, "LOCKED", lockDuration)
                .block();
        return success != null && success;
    }

    /**
     * Releases an active lock.
     */
    public void releaseLock(String lockKey) {
        String fullKey = "lock:acrewise:" + lockKey;
        reactiveRedisTemplate.delete(fullKey).block();
    }
}
