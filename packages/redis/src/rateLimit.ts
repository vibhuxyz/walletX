import { redis } from "./redisClient.js";

export const checkRateLimit = async (
  key: string,
  limit: number,
  ttl: number,
) => {
  const current = await redis.incr(key);

  if (current === 1) {
    await redis.expire(key, ttl);
  }

  const allowed = current <= limit;
  const remaining = Math.max(0, limit - current);

  return { allowed, remaining };
};

export const getRemainingAttempts = async (key: string, limit: number) => {
  const current = await redis.get(key);
  const count = current ? parseInt(current, 10) : 0;

  return Math.max(0, limit - count);
};
