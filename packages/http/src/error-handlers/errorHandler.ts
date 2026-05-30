import { NextFunction, Request, Response } from "express";
import { ApiError } from "@repo/libs";
import { ZodError } from "zod";

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction,
): void {
  const meta = {
    requestId: req.requestId || "unknown",
    timestamp: new Date().toISOString(),
  };

  if (err instanceof ApiError || (err as any).isApiError) {
    const apiError = err as ApiError;
    res.status(apiError.statusCode || 500).json({
      success: false,
      error: {
        code: apiError.code || "INTERNAL_ERROR",
        message: apiError.message,
        details: apiError.details ?? null,
      },
      meta,
    });
    return;
  }

  if (err instanceof ZodError) {
    res.status(400).json({
      success: false,
      error: {
        code: "VALIDATION_ERROR",
        message: "Validation failed",
        details: err.issues.map((issue) => ({
          path: issue.path.join("."),
          message: issue.message,
          code: issue.code,
        })),
      },
      meta,
    });
    return;
  }

  res.status(500).json({
    success: false,
    error: {
      code: "INTERNAL_ERROR",
      message: "Internal server error",
      details:
        process.env.NODE_ENV === "development"
          ? {
              name: err.name,
              message: err.message,
              stack: err.stack,
            }
          : null,
    },
    meta,
  });
}
