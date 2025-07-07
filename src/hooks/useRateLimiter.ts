
import { useState, useCallback } from 'react';

interface RateLimiterConfig {
  maxAttempts: number;
  windowMs: number;
  blockDurationMs?: number;
}

interface RateLimiterState {
  attempts: number;
  lastAttempt: number;
  isBlocked: boolean;
  blockUntil?: number;
}

export const useRateLimiter = (config: RateLimiterConfig) => {
  const [state, setState] = useState<RateLimiterState>({
    attempts: 0,
    lastAttempt: 0,
    isBlocked: false
  });

  const checkRateLimit = useCallback((): { allowed: boolean; remainingAttempts: number; resetTime?: number } => {
    const now = Date.now();
    
    // Check if currently blocked
    if (state.isBlocked && state.blockUntil && now < state.blockUntil) {
      return {
        allowed: false,
        remainingAttempts: 0,
        resetTime: state.blockUntil
      };
    }
    
    // Reset window if enough time has passed
    if (now - state.lastAttempt > config.windowMs) {
      setState({
        attempts: 0,
        lastAttempt: now,
        isBlocked: false
      });
      return {
        allowed: true,
        remainingAttempts: config.maxAttempts - 1
      };
    }
    
    // Check if exceeded max attempts
    if (state.attempts >= config.maxAttempts) {
      const blockUntil = now + (config.blockDurationMs || config.windowMs);
      setState(prev => ({
        ...prev,
        isBlocked: true,
        blockUntil
      }));
      return {
        allowed: false,
        remainingAttempts: 0,
        resetTime: blockUntil
      };
    }
    
    return {
      allowed: true,
      remainingAttempts: config.maxAttempts - state.attempts - 1
    };
  }, [state, config]);

  const recordAttempt = useCallback(() => {
    const now = Date.now();
    setState(prev => ({
      ...prev,
      attempts: prev.attempts + 1,
      lastAttempt: now
    }));
  }, []);

  const reset = useCallback(() => {
    setState({
      attempts: 0,
      lastAttempt: 0,
      isBlocked: false
    });
  }, []);

  return {
    checkRateLimit,
    recordAttempt,
    reset,
    isBlocked: state.isBlocked
  };
};
