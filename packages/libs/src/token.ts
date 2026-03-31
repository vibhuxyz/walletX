import jwt from "jsonwebtoken";

import { ENV } from "@repo/config";
import { nanoid } from "nanoid";
export interface TokenPayload {
  userId: string;
  email: string;
  role: string;
  deviceId: string;
  sessionId: string;
}

export const generateAccessToken = (payload: TokenPayload) => {
  return jwt.sign(payload, ENV.JWT_SECRET || "secret", {
    expiresIn: "15m",
    issuer: "wallet-app",
    audience: "wallet-api",
  });
};

export const verifyAccessToken = (token: string): TokenPayload => {
  return jwt.verify(token, ENV.JWT_SECRET, {
    issuer: "wallet-app",
    audience: "wallet-api",
  }) as TokenPayload;
};

export function generateRefreshTokenId(): string {
  return `rt_${nanoid(32)}`;
}

export function generateSessionId(): string {
  return `sess_${nanoid(21)}`;
}

export function generateTransactionId(prefix: string = "txn"): string {
  return `${prefix}_${nanoid(21)}`;
}

export function generateIdempotencyKey(): string {
  return `idem_${nanoid(32)}`;
}
