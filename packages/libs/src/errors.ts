export class ApiError extends Error {
  constructor(
    public statusCode: number,
    public code: string,
    message: string,
    public details?: any,
  ) {
    super(message);
    this.name = "ApiError";
    Error.captureStackTrace(this, this.constructor);
  }
}

export const ErrorCodes = {
  // Auth
  AUTH_REQUIRED: "AUTH_REQUIRED",
  TOKEN_EXPIRED: "TOKEN_EXPIRED",
  INVALID_CREDENTIALS: "INVALID_CREDENTIALS",
  OTP_EXPIRED: "OTP_EXPIRED",
  INVALID_OTP: "INVALID_OTP",
  MAX_ATTEMPTS_EXCEEDED: "MAX_ATTEMPTS_EXCEEDED",
  OTP_LOCKED: "OTP_LOCKED",
  OTP_SPAM_LOCKED: "OTP_SPAM_LOCKED",
  OTP_COOLDOWN_ACTIVE: "OTP_COOLDOWN_ACTIVE",

  // Wallet
  INSUFFICIENT_BALANCE: "INSUFFICIENT_BALANCE",
  WALLET_NOT_ACTIVE: "WALLET_NOT_ACTIVE",
  WALLET_FROZEN: "WALLET_FROZEN",
  INVALID_PIN: "INVALID_PIN",

  // Transfer
  RECIPIENT_NOT_FOUND: "RECIPIENT_NOT_FOUND",
  RECIPIENT_CANNOT_RECEIVE: "RECIPIENT_CANNOT_RECEIVE",
  CANNOT_SEND_TO_SELF: "CANNOT_SEND_TO_SELF",
  TRANSFER_EXPIRED: "TRANSFER_EXPIRED",
  BALANCE_CHANGED: "BALANCE_CHANGED",

  // Idempotency
  DUPLICATE_REQUEST: "DUPLICATE_REQUEST",

  // Rate Limiting
  RATE_LIMIT_EXCEEDED: "RATE_LIMIT_EXCEEDED",

  // General
  VALIDATION_ERROR: "VALIDATION_ERROR",
  NOT_FOUND: "NOT_FOUND",
  INTERNAL_ERROR: "INTERNAL_ERROR",
} as const;

// Optional: Create a function to generate common errors
export const Errors = {
  badRequest: (code: keyof typeof ErrorCodes, message: string, details?: any) =>
    new ApiError(400, code, message, details),

  unauthorized: (
    code: keyof typeof ErrorCodes,
    message: string,
    details?: any,
  ) => new ApiError(401, code, message, details),

  forbidden: (code: keyof typeof ErrorCodes, message: string, details?: any) =>
    new ApiError(403, code, message, details),

  notFound: (code: keyof typeof ErrorCodes, message: string, details?: any) =>
    new ApiError(404, code, message, details),

  conflict: (code: keyof typeof ErrorCodes, message: string, details?: any) =>
    new ApiError(409, code, message, details),

  internalError: (
    code: keyof typeof ErrorCodes,
    message: string,
    details?: any,
  ) => new ApiError(500, code, message, details),
};
