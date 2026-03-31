import { Request, Response, NextFunction } from "express";
import { ZodTypeAny } from "zod";
import { ApiError } from "@repo/libs";

export function validate(schema: ZodTypeAny) {
  return async (
    req: Request,
    _res: Response,
    next: NextFunction,
  ): Promise<void> => {
    const parsed = await schema.safeParseAsync(req.body);

    if (!parsed.success) {
      next(
        new ApiError(400, "VALIDATION_ERROR", "Validation failed", {
          fields: parsed.error.issues.map((issue) => ({
            path: issue.path.join("."),
            message: issue.message,
            code: issue.code,
          })),
        }),
      );
      return;
    }

    req.body = parsed.data;
    next();
  };
}
