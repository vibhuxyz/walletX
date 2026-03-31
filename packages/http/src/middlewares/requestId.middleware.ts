// packages/http/src/middlewares/request-id.middleware.ts
import { Request, Response, NextFunction } from "express";
import { nanoid } from "nanoid";

export const requestIdMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const requestId =
    (req.headers["x-request-id"] as string) || `req-${nanoid(21)}`;

  // Type assertion
  (req as any).requestId = requestId;
  res.setHeader("X-Request-ID", requestId);
  next();
};
