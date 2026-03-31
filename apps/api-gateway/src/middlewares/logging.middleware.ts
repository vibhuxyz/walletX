import { Logger } from "@repo/libs";
import { NextFunction, Request, Response } from "express";

const logger = new Logger("RequestLogger");

const SLOW_REQUEST_THRESHOLD_MS = 750;

function isStaticOrHealthPath(path: string): boolean {
  return path === "/health" || path.startsWith("/favicon");
}

function shouldLogRequestStart(req: Request): boolean {
  return (
    process.env.NODE_ENV === "development" && !isStaticOrHealthPath(req.path)
  );
}

function shouldLogRequestCompletion(
  req: Request,
  res: Response,
  durationMs: number,
): boolean {
  if (isStaticOrHealthPath(req.path)) {
    return false;
  }

  if (res.statusCode >= 500) {
    return true;
  }

  if (res.statusCode >= 400) {
    return true;
  }

  if (durationMs >= SLOW_REQUEST_THRESHOLD_MS) {
    return true;
  }

  return process.env.NODE_ENV === "development";
}

export const loggingMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const startTime = process.hrtime.bigint();

  if (shouldLogRequestStart(req)) {
    logger.debug("Incoming request", {
      requestId: req.requestId,
      method: req.method,
      path: req.path,
    });
  }

  res.on("finish", () => {
    const durationMs = Number(process.hrtime.bigint() - startTime) / 1_000_000;

    if (!shouldLogRequestCompletion(req, res, durationMs)) {
      return;
    }

    const logData = {
      requestId: req.requestId,
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      durationMs: Math.round(durationMs),
      contentLength: res.getHeader("content-length") ?? undefined,
    };

    if (res.statusCode >= 500) {
      logger.error("Request completed with server error", logData);
      return;
    }

    if (res.statusCode >= 400) {
      logger.warn("Request completed with client error", logData);
      return;
    }

    if (durationMs >= SLOW_REQUEST_THRESHOLD_MS) {
      logger.warn("Slow request completed", logData);
      return;
    }

    logger.debug("Request completed", logData);
  });

  next();
};
