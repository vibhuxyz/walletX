import { checkIdempotency, storeIdempotencyResponse } from "@repo/redis";
import { NextFunction, Request, Response } from "express";

export async function idempotencyMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const idempotencyKey = req.headers["idempotency-key"] as string;

  if (!idempotencyKey) {
    res.status(400).json({
      success: false,
      error: {
        code: "IDEMPOTENCY_KEY_REQUIRED",
        message: "Idempotency-Key header required for this operation",
      },
    });
    return;
  }

  if (!req.user) {
    next();
    return;
  }

  const userId = req.user.userId;

  const result = await checkIdempotency(
    idempotencyKey,
    userId,
    req.path,
    req.body,
  );

  if (result.isDuplicate && result.response) {
    res.status(200).json(result.response);
    return;
  }

  const originalJson = res.json.bind(res);

  res.json = function (body: any) {
    if (res.statusCode >= 200 && res.statusCode < 300) {
      storeIdempotencyResponse(
        idempotencyKey,
        userId,
        req.path,
        body,
        req.body,
      ).catch(() => {});
    }
    return originalJson(body);
  };

  next();
}
