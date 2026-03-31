import { ENV } from "@repo/config";
import {
  ApiError,
  ErrorCodes,
  generateAccessToken,
  generateRefreshTokenId,
  generateSessionId,
} from "@repo/libs";
import { redis, RedisKeys, RedisTTL } from "@repo/redis";
import { RefreshTokenData } from "@repo/types";
import crypto from "crypto";
import { Response } from "express";

interface IssueTokensInput {
  userId: string;
  email: string;
  role: string;
  deviceId: string;
  deviceName: string;
}

interface TokenSet {
  accessToken: string;
  refreshTokenId: string;
  csrfToken: string;
  sessionId: string;
}

export const issueTokens = async (input: IssueTokensInput) => {
  const sessionId = generateSessionId();

  const refreshTokenId = generateRefreshTokenId();
  const csrfToken = crypto.randomBytes(32).toString("hex");

  const accessToken = generateAccessToken({
    userId: input.userId,
    email: input.email,
    deviceId: input.deviceId,
    sessionId,
    role: input.role,
  });

  const tokenData: RefreshTokenData = {
    userId: input.userId,
    email: input.email,
    role: input.role,
    deviceId: input.deviceId,
    deviceName: input.deviceName,
    sessionId,
    createdAt: new Date().toISOString(),
    lastUsedAt: new Date().toISOString(),
  };

  const pipeline = redis.pipeline();
  pipeline.set(
    RedisKeys.REFRESH_TOKEN(refreshTokenId),
    JSON.stringify(tokenData),
    "EX",
    RedisTTL.REFRESH_TOKEN,
  );
  pipeline.sadd(RedisKeys.TOKEN_USER(input.userId), sessionId);
  pipeline.expire(
    RedisKeys.TOKEN_USER(input.userId),
    RedisTTL.REFRESH_TOKEN,
  );
  pipeline.set(RedisKeys.CSRF_TOKEN(sessionId), csrfToken, "EX", 15 * 60);

  await pipeline.exec();

  return { accessToken, refreshTokenId, csrfToken, sessionId };
};

//  rotation token
export async function rotateTokens(
  incomingRefreshTokenId: string,
  deviceId: string,
): Promise<TokenSet> {
  // get existing token data

  const tokenDataStr = await redis.get(
    RedisKeys.REFRESH_TOKEN(incomingRefreshTokenId),
  );
  if (!tokenDataStr) {
    throw new ApiError(
      401,
      ErrorCodes.TOKEN_EXPIRED,
      "Refresh token expired or invalid",
    );
  }

  const tokenData: RefreshTokenData = JSON.parse(tokenDataStr);

  // verify device
  if (tokenData.deviceId !== deviceId) {
    throw new ApiError(403, "DEVICE_MISMATCH", "Device mismatch");
  }

  // delete old token
  await redis.del(RedisKeys.REFRESH_TOKEN(incomingRefreshTokenId));

  return issueTokens({
    userId: tokenData.userId,
    email: tokenData.email,
    role: tokenData.role,
    deviceId: tokenData.deviceId,
    deviceName: tokenData.deviceName,
  });
}
// revoke session logout
export const revokeSession = async (
  refreshTokenId: string,
  sessionId: string,
) => {
  // felete refresh token
  await redis.del(RedisKeys.REFRESH_TOKEN(refreshTokenId));

  // blacklist access token
  await redis.set(
    RedisKeys.BLACKLIST_ACCESS(sessionId),
    "1",
    "EX",
    RedisTTL.ACCESS_BLACKLIST,
  );
};

// reveke all user session
export const revokeAllUserSessions = async (userId: string) => {
  // get all session IDs
  const sessionIds = await redis.smembers(RedisKeys.TOKEN_USER(userId));

  // blacklist all sessions

  const pipeline = redis.pipeline();
  for (const sessionId of sessionIds) {
    pipeline.set(
      RedisKeys.BLACKLIST_ACCESS(sessionId),
      "1",
      "EX",
      RedisTTL.ACCESS_BLACKLIST,
    );
  }
  await pipeline.exec();
  // clear session set
  await redis.del(RedisKeys.TOKEN_USER(userId));
};

function getCookiePrefix(role: string): string {
  switch (role) {
    case "USER":
      return "user";
    case "MERCHANT":
      return "merchant";
    case "BANK_ADMIN":
      return "bankAdmin";
    case "SUPER_ADMIN":
      return "superAdmin";
    default:
      return "user";
  }
}

export const setAuthCookies = async (
  res: Response,
  tokens: TokenSet,
  role: string,
) => {
  const cookiePrefix = getCookiePrefix(role);
  const isProduction = ENV.NODE_ENV.toLowerCase() === "production";
  const sameSite: "none" | "lax" = isProduction ? "none" : "lax";

  const cookieOptions = {
    secure: isProduction,
    sameSite,
  };

  res.cookie(`${cookiePrefix}AccessToken`, tokens.accessToken, {
    ...cookieOptions,
    httpOnly: true,
    maxAge: 15 * 60 * 1000,
  });

  res.cookie(`${cookiePrefix}RefreshToken`, tokens.refreshTokenId, {
    ...cookieOptions,
    httpOnly: true,
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: "/api/v0/auth/refresh",
  });

  res.cookie(`${cookiePrefix}CsrfToken`, tokens.csrfToken, {
    ...cookieOptions,
    httpOnly: false,
    maxAge: 15 * 60 * 1000,
  });

  // role identifier for frontend to know which account is logged in

  res.cookie(`${cookiePrefix}Role`, role, {
    ...cookieOptions,
    httpOnly: false,
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
};

export function clearAuthCookies(res: Response, role: string): void {
  const cookiePrefix = getCookiePrefix(role);
  const isProduction = ENV.NODE_ENV.toLowerCase() === "production";
  const sameSite: "none" | "lax" = isProduction ? "none" : "lax";

  const clearOptions = {
    secure: isProduction,
    sameSite,
  };

  res.clearCookie(`${cookiePrefix}AccessToken`, {
    ...clearOptions,
    httpOnly: true,
  });
  res.clearCookie(`${cookiePrefix}RefreshToken`, {
    ...clearOptions,
    httpOnly: true,
    path: "/api/v0/auth/refresh",
  });
  res.clearCookie(`${cookiePrefix}CsrfToken`, {
    ...clearOptions,
    httpOnly: false,
  });
  res.clearCookie(`${cookiePrefix}Role`, {
    ...clearOptions,
    httpOnly: false,
  });
}

export function getTokensFromRequest(
  req: any,
  role: string,
): {
  accessToken?: string;
  refreshToken?: string;
  csrfToken?: string;
} {
  const cookiePrefix = getCookiePrefix(role);

  return {
    accessToken: req.cookies?.[`${cookiePrefix}AccessToken`],
    refreshToken: req.cookies?.[`${cookiePrefix}RefreshToken`],
    csrfToken: req.cookies?.[`${cookiePrefix}CsrfToken`],
  };
}
