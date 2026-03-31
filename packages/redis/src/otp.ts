import { RedisKeys, RedisTTL } from "./keys.js";
import { redis } from "./redisClient.js";

interface OTPSession {
  hashedOtp: string;
  userId: string;
  userType?: string;
  accountId?: string;
  ip?: string;
  deviceName?: string;
}

/**
 * Store OTP session in Redis with expiry
 * Used when OTP is generated
 */
export const storeOtp = async (
  key: string,
  session: OTPSession,
  ttl: number = RedisTTL.OTP_EMAIL,
) => {
  // Store OTP session data
  await redis.set(key, JSON.stringify(session), "EX", ttl);

  // Initialize attempts counter separately (atomic counter key)
  await redis.set(`${key}:attempts`, 0, "EX", ttl);
};

/**
 * Get OTP session data
 */
export const getOtp = async (key: string): Promise<OTPSession | null> => {
  const data = await redis.get(key);
  return data ? (JSON.parse(data) as OTPSession) : null;
};

/**
 * Delete OTP session + attempts counter
 */
export const deleteOtp = async (key: string) => {
  await redis.del(key);
  await redis.del(`${key}:attempts`);
};

/**
 * Increment OTP attempts (Atomic Operation)
 * FIX: Uses Redis INCR instead of read-modify-write
 * Purpose: Prevent race condition when multiple OTP attempts happen simultaneously
 */
export const incrementOTPAttempts = async (key: string) => {
  // Atomic increment (safe even under high concurrency)
  const attempts = await redis.incr(`${key}:attempts`);

  return attempts;
};

interface OtpRestrictions {
  isLocked: boolean;
  isSpamLocked: boolean;
  isCooldownActive: boolean;
}

interface OtpRequestTrackingResult {
  requestCount: number;
  isSpamLocked: boolean;
}

interface OtpFailureTrackingResult {
  attempts: number;
  remainingAttempts: number;
  isLocked: boolean;
}

export const getOtpRestrictions = async (
  scope: string,
  identifier: string,
): Promise<OtpRestrictions> => {
  const [lock, spamLock, cooldown] = await Promise.all([
    redis.get(RedisKeys.OTP_LOCK(scope, identifier)),
    redis.get(RedisKeys.OTP_SPAM_LOCK(scope, identifier)),
    redis.get(RedisKeys.OTP_COOLDOWN(scope, identifier)),
  ]);

  return {
    isLocked: !!lock,
    isSpamLocked: !!spamLock,
    isCooldownActive: !!cooldown,
  };
};

export const trackOtpRequest = async (
  scope: string,
  identifier: string,
  maxRequests: number = 2,
): Promise<OtpRequestTrackingResult> => {
  const requestsKey = RedisKeys.OTP_REQUESTS_COUNT(scope, identifier);
  const requestCount = await redis.incr(requestsKey);

  if (requestCount === 1) {
    await redis.expire(requestsKey, RedisTTL.OTP_REQUEST_WINDOW);
  }

  if (requestCount > maxRequests) {
    await redis.set(
      RedisKeys.OTP_SPAM_LOCK(scope, identifier),
      "locked",
      "EX",
      RedisTTL.OTP_SPAM_LOCK,
    );

    return { requestCount, isSpamLocked: true };
  }

  await redis.set(
    RedisKeys.OTP_COOLDOWN(scope, identifier),
    "active",
    "EX",
    RedisTTL.OTP_COOLDOWN,
  );

  return { requestCount, isSpamLocked: false };
};

export const trackOtpFailure = async (
  scope: string,
  identifier: string,
  maxAttempts: number = 5,
): Promise<OtpFailureTrackingResult> => {
  const attemptsKey = RedisKeys.OTP_FAILED_ATTEMPTS(scope, identifier);
  const attempts = await redis.incr(attemptsKey);

  if (attempts === 1) {
    await redis.expire(attemptsKey, RedisTTL.OTP_FAILED_ATTEMPTS_WINDOW);
  }

  if (attempts >= maxAttempts) {
    await redis.set(
      RedisKeys.OTP_LOCK(scope, identifier),
      "locked",
      "EX",
      RedisTTL.OTP_LOCK,
    );

    return { attempts, remainingAttempts: 0, isLocked: true };
  }

  return {
    attempts,
    remainingAttempts: Math.max(0, maxAttempts - attempts),
    isLocked: false,
  };
};

export const clearOtpTracking = async (scope: string, identifier: string) => {
  await redis.del(
    RedisKeys.OTP_FAILED_ATTEMPTS(scope, identifier),
    RedisKeys.OTP_LOCK(scope, identifier),
    RedisKeys.OTP_COOLDOWN(scope, identifier),
    RedisKeys.OTP_REQUESTS_COUNT(scope, identifier),
    RedisKeys.OTP_SPAM_LOCK(scope, identifier),
  );
};
