import { Express } from "express";
import rateLimit from "express-rate-limit";
import { Logger } from "@repo/libs";

const logger = new Logger("RateLimiter");

function createLimiter(options: {
  windowMs: number;
  max: number;
  message: string;
  skipSuccessfulRequests?: boolean;
}) {
  return rateLimit({
    windowMs: options.windowMs,
    max: options.max,
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: options.skipSuccessfulRequests ?? false,
    handler: (req, res) => {
      const requestRateLimit = (req as any).rateLimit as
        | { resetTime?: Date }
        | undefined;
      const resetTime =
        requestRateLimit?.resetTime instanceof Date
          ? requestRateLimit.resetTime.getTime()
          : Date.now() + options.windowMs;
      const retryAfterSeconds = Math.max(
        1,
        Math.ceil((resetTime - Date.now()) / 1000),
      );

      logger.warn("Rate limit exceeded", {
        ip: req.ip,
        path: req.path,
        requestId: req.requestId,
        windowMs: options.windowMs,
        max: options.max,
        retryAfterSeconds,
      });

      res.setHeader("Retry-After", retryAfterSeconds.toString());

      res.status(429).json({
        success: false,
        error: {
          code: "RATE_LIMIT_EXCEEDED",
          message: options.message,
          details: {
            retryAfterSeconds,
          },
        },
        meta: {
          requestId: req.requestId || "unknown",
          timestamp: new Date().toISOString(),
        },
      });
    },
  });
}

export function setupRateLimiting(app: Express) {
  const globalLimiter = createLimiter({
    windowMs: 60 * 1000, // 1 min
    max: 100,
    message: "Too many requests, please try again later.",
  });

  app.use(globalLimiter);

  // Moderate auth limiter for register/login endpoints
  const authLimiter = createLimiter({
    windowMs: 15 * 60 * 1000,
    max: 8,
    message: "Too many authentication attempts, please try again later.",
    skipSuccessfulRequests: true,
  });

  // OTP request endpoints are stricter because they can be abused for spam.
  const otpRequestLimiter = createLimiter({
    windowMs: 10 * 60 * 1000,
    max: 4,
    message: "Too many OTP requests, please wait before trying again.",
  });

  // OTP verification still allows retries, but limits brute-force attempts.
  const otpVerifyLimiter = createLimiter({
    windowMs: 10 * 60 * 1000,
    max: 8,
    message: "Too many OTP verification attempts, try again later.",
    skipSuccessfulRequests: true,
  });

  // Password reset flow is high-risk and should be strict.
  const passwordSecurityLimiter = createLimiter({
    windowMs: 30 * 60 * 1000,
    max: 4,
    message: "Too many password recovery attempts, please try again later.",
    skipSuccessfulRequests: true,
  });

  // PIN endpoints guard wallet security and should be very strict.
  const pinSecurityLimiter = createLimiter({
    windowMs: 30 * 60 * 1000,
    max: 3,
    message: "Too many PIN operations, please try again later.",
    skipSuccessfulRequests: true,
  });

  // Account deletion is destructive: keep limits tight.
  const accountDeleteLimiter = createLimiter({
    windowMs: 60 * 60 * 1000,
    max: 2,
    message: "Too many account deletion attempts, please try again later.",
    skipSuccessfulRequests: true,
  });

  app.use("/api/v0/auth/register-user", authLimiter);
  app.use("/api/v0/auth/register/bank-admin", authLimiter);
  app.use("/api/v0/auth/login-user", authLimiter);

  app.use("/api/v0/auth/resend-login-otp", otpRequestLimiter);
  app.use("/api/v0/auth/resend-otp", otpRequestLimiter);
  app.use("/api/v0/auth/verify-email", otpVerifyLimiter);
  app.use("/api/v0/auth/user-verify-otp", otpVerifyLimiter);

  app.use("/api/v0/auth/forgot-password", passwordSecurityLimiter);
  app.use("/api/v0/auth/resend-forgot-password-otp", passwordSecurityLimiter);
  app.use("/api/v0/auth/reset-password", passwordSecurityLimiter);

  app.use("/api/v0/auth/forgot-pin", pinSecurityLimiter);
  app.use("/api/v0/auth/resend-forgot-pin-otp", pinSecurityLimiter);
  app.use("/api/v0/auth/reset-pin", pinSecurityLimiter);
  app.use("/api/v0/auth/change-pin", pinSecurityLimiter);

  app.use("/api/v0/auth/delete-account/request-otp", accountDeleteLimiter);
  app.use("/api/v0/auth/delete-account/resend-otp", accountDeleteLimiter);
  app.use("/api/v0/auth/delete-account/confirm", accountDeleteLimiter);

  const paymentLimiter = createLimiter({
    windowMs: 60 * 1000,
    max: 5,
    message: "Too many payment requests, please try again later.",
  });

  app.use("/api/v0/wallet/transfer/confirm", paymentLimiter);
  app.use("/api/v0/wallet/topup/confirm", paymentLimiter);
  app.use("/api/v0/wallet/withdraw", paymentLimiter);
  app.use("/payments/merchant/pay", paymentLimiter);

  logger.info("Rate limiting configured");
}
