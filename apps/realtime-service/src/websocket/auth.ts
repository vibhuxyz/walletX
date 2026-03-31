import jwt, { JwtPayload } from "jsonwebtoken";

import { ENV } from "@repo/config";

import { Logger } from "@repo/libs";

const logger = new Logger("WebSocketAuth");

export interface JWTPayload {
  userId: string;
  email: string;
  role: string;
  sessionId?: string;
  tokenType?: string;
}

export function verifyToken(token: string): JWTPayload | null {
  try {
    const decoded = jwt.verify(token, ENV.JWT_SECRET, {
      issuer: "wallet-app",
      audience: "wallet-realtime",
    }) as JwtPayload;

    if (decoded.tokenType && decoded.tokenType !== "ws") {
      return null;
    }

    return decoded as JWTPayload;
  } catch (error) {
    logger.error("JWT verification failed", error);
    return null;
  }
}

// extract the token from websocket hearder
export const extractTokenFromUrl = (url: string): string | null => {
  try {
    const urlObj = new URL(url, "ws://localhost");
    return urlObj.searchParams.get("token");
  } catch (error) {
    logger.error("Failed to extract token from URL", error);
    return null;
  }
};
