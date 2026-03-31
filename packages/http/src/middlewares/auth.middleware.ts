
import { ApiError, ErrorCodes, verifyAccessToken } from "@repo/libs";
import { NextFunction, Request, Response } from "express";
import { redis } from "@repo/redis";

import { JWTPayload } from "@repo/types";

export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const roles = ["user", "merchant", "bankAdmin", "superAdmin"];

    let token: string | undefined;
    let foundRole: string | undefined;

    for (const role of roles) {
      const roleToken = req.cookies?.[`${role}AccessToken`];
      if (roleToken) {
        token = roleToken;
        foundRole = role;
        break;
      }
    }

    if (!token) {
      token = req.headers.authorization?.replace("Bearer ", "");
    }
    if (!token) {
      throw new ApiError(
        401,
        ErrorCodes.AUTH_REQUIRED,
        "Authentication required",
      );
    }

    const payload = verifyAccessToken(token) as JWTPayload;

    // check if token is blacklisted
    const isBlacklisted = await redis.exists(`bl:access:${payload.sessionId}`);

    if (isBlacklisted) {
      throw new ApiError(
        401,
        ErrorCodes.TOKEN_EXPIRED,
        "Token expired: Token has been revoked",
      );
    }

    req.user = payload;

    next();
  } catch (error) {
    if (error instanceof ApiError) {
      next(error);
    } else if ((error as any).name === "TokenExpiredError") {
      next(new ApiError(401, ErrorCodes.TOKEN_EXPIRED, "Access token expired"));
    } else if ((error as any).name === "JsonWebTokenError") {
      next(new ApiError(401, ErrorCodes.AUTH_REQUIRED, "Invalid token"));
    } else {
      next(error);
    }
  }
};

export const requireRole = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(
        new ApiError(401, ErrorCodes.AUTH_REQUIRED, "Authentication required"),
      );
    }

    if (!roles.includes(req.user.role)) {
      return next(new ApiError(403, "FORBIDDEN", "Insufficient permissions"));
    }
    next();
  };
};
