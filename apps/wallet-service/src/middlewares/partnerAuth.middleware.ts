import { prismaPostgres } from "@repo/db-postgres";
import { ApiError } from "@repo/libs";
import crypto from "crypto";
import { NextFunction, Request, Response } from "express";

function sha256(value: string) {
  return crypto.createHash("sha256").update(value).digest("hex");
}

export async function partnerAuthMiddleware(
  req: Request,
  _res: Response,
  next: NextFunction,
) {
  try {
    const apiKey = req.header("X-Partner-Key");
    const apiSecret = req.header("X-Partner-Secret");

    if (!apiKey || !apiSecret) {
      throw new ApiError(
        401,
        "PARTNER_AUTH_REQUIRED",
        "X-Partner-Key and X-Partner-Secret headers are required",
      );
    }

    const partner = await (prismaPostgres as any).partnerApp.findUnique({
      where: { apiKey },
      select: {
        id: true,
        name: true,
        apiSecretHash: true,
        status: true,
        scopes: true,
        redirectUris: true,
      },
    });

    if (!partner || partner.status !== "ACTIVE") {
      throw new ApiError(401, "INVALID_PARTNER", "Invalid partner app");
    }

    const expected = Buffer.from(partner.apiSecretHash, "hex");
    const actual = Buffer.from(sha256(apiSecret), "hex");

    if (
      expected.length !== actual.length ||
      !crypto.timingSafeEqual(expected, actual)
    ) {
      throw new ApiError(401, "INVALID_PARTNER", "Invalid partner app");
    }

    req.partner = {
      id: partner.id,
      name: partner.name,
      scopes: partner.scopes,
      redirectUris: partner.redirectUris,
    };

    next();
  } catch (error) {
    next(error);
  }
}

export function requirePartnerScope(scope: string) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.partner) {
      return next(
        new ApiError(401, "PARTNER_AUTH_REQUIRED", "Partner auth required"),
      );
    }

    if (!req.partner.scopes.includes(scope)) {
      return next(new ApiError(403, "PARTNER_SCOPE_DENIED", "Missing scope"));
    }

    next();
  };
}
