import { RedisKeys } from "./keys.js";
import { redis } from "./redisClient.js";

export async function cacheGetOrSet<T>(
  key: string,
  ttlSeconds: number,
  loader: () => Promise<T>,
): Promise<T> {
  const cached = await redis.get(key);
  if (cached) {
    return JSON.parse(cached) as T;
  }

  const value = await loader();
  await redis.set(key, JSON.stringify(value), "EX", ttlSeconds);
  return value;
}

export async function invalidateCachePattern(pattern: string): Promise<number> {
  let cursor = "0";
  let deleted = 0;

  do {
    const [nextCursor, keys] = await redis.scan(
      cursor,
      "MATCH",
      pattern,
      "COUNT",
      100,
    );
    cursor = nextCursor;

    if (keys.length > 0) {
      deleted += await redis.del(...keys);
    }
  } while (cursor !== "0");

  return deleted;
}

export async function invalidateWalletReadCaches(
  userIds: string[],
): Promise<number> {
  const uniqueUserIds = [...new Set(userIds.filter(Boolean))];

  if (uniqueUserIds.length === 0) {
    return 0;
  }

  let deleted = 0;

  for (const userId of uniqueUserIds) {
    deleted += await redis.del(
      RedisKeys.WALLET_BALANCE(userId),
      RedisKeys.RECENT_RECIPIENTS(userId),
      RedisKeys.DASHBOARD_SUMMARY(userId),
      RedisKeys.DASHBOARD_FRESHNESS(userId),
    );
    deleted += await invalidateCachePattern(
      RedisKeys.LEDGER_ANALYTICS_PATTERN(userId),
    );
    deleted += await invalidateCachePattern(
      RedisKeys.LEDGER_STATS_PATTERN(userId),
    );
  }

  return deleted;
}
