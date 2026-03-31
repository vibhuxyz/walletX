import { prismaPostgres } from "@repo/db-postgres";
import {
  ApiError,
  ErrorCodes,
  generateOTP,
  hashOTP,
  hashPassword,
  Logger,
  verifyOTP,
} from "@repo/libs";
import { Exchanges, publishMessage, RoutingKeys } from "@repo/rabbitmq";
import {
  clearOtpTracking,
  getOtpRestrictions,
  redis,
  RedisKeys,
  RedisTTL,
  trackOtpFailure,
  trackOtpRequest,
} from "@repo/redis";

const logger = new Logger("password.service");
const OTP_SCOPE = "password-reset";
const OTP_MAX_REQUESTS = 2;
const OTP_MAX_ATTEMPTS = 5;

const enforceOtpRequestRestrictions = async (identifier: string) => {
  const restrictions = await getOtpRestrictions(OTP_SCOPE, identifier);
  if (restrictions.isLocked) {
    throw new ApiError(
      429,
      ErrorCodes.OTP_LOCKED,
      "Account locked due to multiple failed attempts. Try again after 30 minutes.",
    );
  }
  if (restrictions.isSpamLocked) {
    throw new ApiError(
      429,
      ErrorCodes.OTP_SPAM_LOCKED,
      "Too many OTP requests. Please try again later.",
    );
  }
  if (restrictions.isCooldownActive) {
    throw new ApiError(
      429,
      ErrorCodes.OTP_COOLDOWN_ACTIVE,
      "OTP request cooldown active. Please wait before requesting another OTP.",
    );
  }
};

const consumeOtpRequestSlot = async (identifier: string) => {
  const requestState = await trackOtpRequest(
    OTP_SCOPE,
    identifier,
    OTP_MAX_REQUESTS,
  );
  if (requestState.isSpamLocked) {
    throw new ApiError(
      429,
      ErrorCodes.OTP_SPAM_LOCKED,
      "Too many OTP requests. Please try again after some time.",
    );
  }
};

export const sendPasswordResetOTP = async (email: string) => {
  const identifier = email.toLowerCase();
  await enforceOtpRequestRestrictions(identifier);
  await consumeOtpRequestSlot(identifier);

  const user = await prismaPostgres.user.findUnique({
    where: { email: identifier },
    select: {
      id: true,
      fullName: true,
    },
  });

  if (!user) {
    return;
  }

  const otp = generateOTP(6);
  const hashedOtp = await hashOTP(otp);

  await redis.set(
    RedisKeys.OTP_PASSWORD_RESET(identifier),
    JSON.stringify({
      hashedOtp,
      userId: user.id,
      attempts: 0,
    }),
    "EX",
    RedisTTL.OTP_RESET,
  );

  await publishMessage(
    Exchanges.NOTIFICATIONS,
    RoutingKeys.EMAIL_PASSWORD_RESET,
    {
      to: identifier,
      template: "password-reset",
      data: {
        name: user.fullName,
        otp,
        expiryMinutes: 10,
      },
    },
  );
  logger.info("Password reset OTP sent", { email: identifier });
};

export const resendPasswordResetOTP = async (email: string) => {
  const identifier = email.toLowerCase();
  await enforceOtpRequestRestrictions(identifier);
  await consumeOtpRequestSlot(identifier);

  const sessionData = await redis.get(RedisKeys.OTP_PASSWORD_RESET(identifier));
  if (!sessionData) {
    throw new ApiError(
      404,
      "NO_PENDING_PASSWORD_RESET",
      "No pending password reset request for this email",
    );
  }

  const session = JSON.parse(sessionData);
  const user = await prismaPostgres.user.findUnique({
    where: { id: session.userId },
    select: { fullName: true },
  });

  if (!user) {
    throw new ApiError(404, "USER_NOT_FOUND", "User not found");
  }

  const otp = generateOTP(6);
  const hashedOtp = await hashOTP(otp);

  await redis.set(
    RedisKeys.OTP_PASSWORD_RESET(identifier),
    JSON.stringify({
      ...session,
      hashedOtp,
      attempts: 0,
    }),
    "EX",
    RedisTTL.OTP_RESET,
  );

  await publishMessage(
    Exchanges.NOTIFICATIONS,
    RoutingKeys.EMAIL_PASSWORD_RESET,
    {
      to: identifier,
      template: "password-reset",
      data: {
        name: user.fullName,
        otp,
        expiryMinutes: 10,
      },
    },
  );

  logger.info("Password reset OTP resent", { email: identifier });
};

export const resetPasswordWithOtp = async (
  email: string,
  otp: string,
  newPassword: string,
) => {
  const identifier = email.toLowerCase();
  const restrictions = await getOtpRestrictions(OTP_SCOPE, identifier);
  if (restrictions.isLocked) {
    throw new ApiError(
      429,
      ErrorCodes.OTP_LOCKED,
      "Account locked due to multiple failed attempts. Try again after 30 minutes.",
    );
  }

  const sessionData = await redis.get(RedisKeys.OTP_PASSWORD_RESET(identifier));
  if (!sessionData) {
    throw new ApiError(400, ErrorCodes.OTP_EXPIRED, "OTP expired or invalid");
  }

  const session = JSON.parse(sessionData);
  const isValid = await verifyOTP(otp, session.hashedOtp);

  if (!isValid) {
    const failedState = await trackOtpFailure(
      OTP_SCOPE,
      identifier,
      OTP_MAX_ATTEMPTS,
    );

    if (failedState.isLocked) {
      await redis.del(RedisKeys.OTP_PASSWORD_RESET(identifier));
      throw new ApiError(
        429,
        ErrorCodes.MAX_ATTEMPTS_EXCEEDED,
        "Maximum OTP attempts exceeded",
      );
    }

    throw new ApiError(400, ErrorCodes.INVALID_OTP, "Invalid OTP", {
      remainingAttempts: failedState.remainingAttempts,
    });
  }

  const hashedPassword = await hashPassword(newPassword);
  await prismaPostgres.user.update({
    where: { id: session.userId },
    data: {
      hashedPassword,
    },
  });

  await redis.del(RedisKeys.OTP_PASSWORD_RESET(identifier));
  await clearOtpTracking(OTP_SCOPE, identifier);
  logger.info("Password reset successfully", { email: identifier });
};
