import { Logger } from "@repo/libs";
import { RedisKeys, RedisTTL } from "./keys.js";
import { redis } from "./redisClient.js";
import crypto from "crypto";

const logger = new Logger("idempotency");

const TTL = 86400; // 48 hours

export const checkIdempotency = async (
  key: string,
  userId: string,
  endpoint: string,
  body: any,
): Promise<{ isDuplicate: boolean; response?: any }> => {
  const cacheKey = RedisKeys.IDEMPOTENCY(key);

  const cached = await redis.get(cacheKey);

  if (!cached) {
    return { isDuplicate: false };
  }

  const data = JSON.parse(cached);

  const requestHash = crypto
    .createHash("sha256")
    .update(JSON.stringify(body))
    .digest("hex");

  if (
    data.requestHash === requestHash &&
    data.userId === userId &&
    data.endpoint === endpoint
  ) {
    logger.info("Idempotent request detected", { key, userId, endpoint });
    return {
      isDuplicate: true,
      response: data.response,
    };
  }

  return { isDuplicate: false };
};

export async function storeIdempotencyResponse(
  key: string,
  userId: string,
  endpoint: string,
  response: any,
  body: any,
) {
  const cacheKey = RedisKeys.IDEMPOTENCY(key);

  const requestHash = crypto
    .createHash("sha256")
    .update(JSON.stringify(body))
    .digest("hex");

  await redis.set(
    cacheKey,
    JSON.stringify({
      userId,
      requestHash,
      response,
      endpoint,
      timestamp: new Date().toISOString(),
    }),
    "EX",
    RedisTTL.IDEMPOTENCY,
  );
}

export async function acquireLock(
  resource: string,
  ttl: number = 10,
): Promise<string | null> {
  const lockKey = RedisKeys.LOCK(resource);
  const lockValue = crypto.randomBytes(16).toString("hex");

  const acquired = await redis.set(lockKey, lockValue, "EX", ttl, "NX");

  if (acquired === "OK") {
    return lockValue;
  }

  return null;
}

export const releaseLock = async (resource: string, lockValue: string) => {
  const lockKey = RedisKeys.LOCK(resource);

  const script = `
      if redis.call("get", KEYS[1]) == ARGV[1] then
        return redis.call("del", KEYS[1])
      else
        return 0
      end
    `;

  await redis.eval(script, 1, lockKey, lockValue);
};

export async function withLock<T>(
  resource: string,
  ttl: number,
  fn: () => Promise<T>,
): Promise<T> {
  let lockValue: string | null = null;
  let attempts = 0;
  const maxAttempts = 50;

  while (attempts < maxAttempts) {
    lockValue = await acquireLock(resource, ttl);
    if (lockValue) break;

    await new Promise((resolve) => setTimeout(resolve, 100));
    attempts++;
  }

  if (!lockValue) {
    throw new Error(`Failed to acquire lock for resource: ${resource}`);
  }

  try {
    return await fn();
  } finally {
    await releaseLock(resource, lockValue);
  }
}
