import { prismaPostgres } from "@repo/db-postgres";
import {
  ApiError,
  ErrorCodes,
  generateOTP,
  hashOTP,
  hashPin,
  Logger,
  validatePIN,
  verifyOTP,
  verifyPin,
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

const logger = new Logger("pin.service");
const OTP_SCOPE = "pin-reset";
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

export const setWalletPin = async (
  userId: string,
  pin: string,
): Promise<void> => {
  const validation = validatePIN(pin);

  if (!validation.valid) {
    throw new ApiError(400, "INVALID_PIN_FORMAT", validation.error!);
  }

  const user = await prismaPostgres.user.findUnique({
    where: { id: userId },
    select: { hashedPin: true },
  });
  if (!user) throw new ApiError(404, "USER_NOT_FOUND", "User not found");

  if (user.hashedPin) {
    throw new ApiError(400, "PIN_ALREADY_EXISTS", "PIN already exists.");
  }

  //hash pin
  const hashedPin = await hashPin(pin);

  // update user and wallet 
  await prismaPostgres.$transaction(async (tx) => {
    await tx.user.update({
      where: {
        id: userId,
      },
      data: {
        hashedPin,
      },
    });

    // update wallet status
    const wallet = await tx.wallet.findUnique({
      where: {
        userId,
      },
    });

    if (wallet && wallet.status === "PENDING_PIN") {
      await tx.wallet.update({
        where: { userId },
        data: {
          status: "PENDING_KYC",
        },
      });
    }
  });
  logger.info("PIN set successfully", { userId });
};

export const removeWalletPin = async (userId: string): Promise<void> => {
  const user = await prismaPostgres.user.findUnique({
    where: { id: userId },
    select: { hashedPin: true },
  });

  if (!user?.hashedPin) {
    throw new ApiError(400, "PIN_NOT_SET", "No PIN exists to delete");
  }

  await prismaPostgres.$transaction(async (tx) => {
    // Remove the PIN from the user
    await tx.user.update({
      where: { id: userId },
      data: { hashedPin: null },
    });

    // downgrade the wallet status so they can't make transfers without a PIN
    await tx.wallet.update({
      where: { userId },
      data: { status: "PENDING_PIN" },
    });
  });

  logger.info("PIN removed successfully", { userId });
};

export const changeWalletPin = async (
  userId: string,
  currentPin: string,
  newPin: string,
): Promise<void> => {
  const validation = validatePIN(newPin);
  if (!validation.valid) {
    throw new ApiError(400, "INVALID_PIN_FORMAT", validation.error!);
  }

  const user = await prismaPostgres.user.findUnique({
    where: { id: userId },
    select: { hashedPin: true },
  });
  if (!user?.hashedPin) {
    throw new ApiError(400, "PIN_NOT_SET", "No PIN exists to change");
  }

  const pinChangeCooldownKey = RedisKeys.PIN_CHANGE_COOLDOWN(userId);
  const isCooldownActive = await redis.get(pinChangeCooldownKey);
  if (isCooldownActive) {
    const retryAfterSeconds = await redis.ttl(pinChangeCooldownKey);
    throw new ApiError(
      429,
      "PIN_CHANGE_COOLDOWN",
      "PIN can be changed only once every 7 days",
      {
        retryAfterSeconds: retryAfterSeconds > 0 ? retryAfterSeconds : undefined,
      },
    );
  }

  const isCurrentPinValid = await verifyPin(currentPin, user.hashedPin);
  if (!isCurrentPinValid) {
    throw new ApiError(400, ErrorCodes.INVALID_PIN, "Current PIN is invalid");
  }

  const isSamePin = await verifyPin(newPin, user.hashedPin);
  if (isSamePin) {
    throw new ApiError(
      400,
      "PIN_SAME_AS_OLD",
      "New PIN must be different from current PIN",
    );
  }

  const hashedPin = await hashPin(newPin);
  await prismaPostgres.user.update({
    where: { id: userId },
    data: { hashedPin },
  });

  await redis.set(
    pinChangeCooldownKey,
    "active",
    "EX",
    RedisTTL.PIN_CHANGE_COOLDOWN,
  );
};

export const requestForgotPinOtp = async (userId: string) => {
  const user = await prismaPostgres.user.findUnique({
    where: { id: userId },
    select: { email: true, fullName: true, hashedPin: true },
  });
  if (!user) {
    throw new ApiError(404, "USER_NOT_FOUND", "User not found");
  }
  if (!user.hashedPin) {
    throw new ApiError(400, "PIN_NOT_SET", "No PIN exists to reset");
  }

  const identifier = user.email.toLowerCase();
  await enforceOtpRequestRestrictions(identifier);
  await consumeOtpRequestSlot(identifier);

  const otp = generateOTP(6);
  const hashedOtp = await hashOTP(otp);

  await redis.set(
    RedisKeys.OTP_PIN_RESET(userId),
    JSON.stringify({
      userId,
      email: identifier,
      hashedOtp,
      attempts: 0,
    }),
    "EX",
    RedisTTL.OTP_PIN_RESET,
  );

  await publishMessage(Exchanges.NOTIFICATIONS, RoutingKeys.EMAIL_PIN_RESET, {
    to: identifier,
    template: "pin-reset",
    data: {
      name: user.fullName,
      otp,
      expiryMinutes: 10,
    },
  });
};

export const resendForgotPinOtp = async (userId: string) => {
  const sessionData = await redis.get(RedisKeys.OTP_PIN_RESET(userId));
  if (!sessionData) {
    throw new ApiError(
      404,
      "NO_PENDING_PIN_RESET",
      "No pending PIN reset request",
    );
  }

  const session = JSON.parse(sessionData);
  const identifier = (session.email as string).toLowerCase();
  await enforceOtpRequestRestrictions(identifier);
  await consumeOtpRequestSlot(identifier);

  const user = await prismaPostgres.user.findUnique({
    where: { id: userId },
    select: { fullName: true },
  });
  if (!user) {
    throw new ApiError(404, "USER_NOT_FOUND", "User not found");
  }

  const otp = generateOTP(6);
  const hashedOtp = await hashOTP(otp);

  await redis.set(
    RedisKeys.OTP_PIN_RESET(userId),
    JSON.stringify({
      ...session,
      hashedOtp,
      attempts: 0,
    }),
    "EX",
    RedisTTL.OTP_PIN_RESET,
  );

  await publishMessage(Exchanges.NOTIFICATIONS, RoutingKeys.EMAIL_PIN_RESET, {
    to: identifier,
    template: "pin-reset",
    data: {
      name: user.fullName,
      otp,
      expiryMinutes: 10,
    },
  });
};

export const resetPinWithOtp = async (
  userId: string,
  otp: string,
  newPin: string,
): Promise<void> => {
  const validation = validatePIN(newPin);
  if (!validation.valid) {
    throw new ApiError(400, "INVALID_PIN_FORMAT", validation.error!);
  }

  const sessionData = await redis.get(RedisKeys.OTP_PIN_RESET(userId));
  if (!sessionData) {
    throw new ApiError(400, ErrorCodes.OTP_EXPIRED, "OTP expired or invalid");
  }

  const session = JSON.parse(sessionData);
  const identifier = (session.email as string).toLowerCase();
  const restrictions = await getOtpRestrictions(OTP_SCOPE, identifier);
  if (restrictions.isLocked) {
    throw new ApiError(
      429,
      ErrorCodes.OTP_LOCKED,
      "Account locked due to multiple failed attempts. Try again after 30 minutes.",
    );
  }

  const isValid = await verifyOTP(otp, session.hashedOtp);
  if (!isValid) {
    const failedState = await trackOtpFailure(
      OTP_SCOPE,
      identifier,
      OTP_MAX_ATTEMPTS,
    );
    if (failedState.isLocked) {
      await redis.del(RedisKeys.OTP_PIN_RESET(userId));
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

  const user = await prismaPostgres.user.findUnique({
    where: { id: userId },
    select: { hashedPin: true },
  });
  if (!user) {
    throw new ApiError(404, "USER_NOT_FOUND", "User not found");
  }

  if (user.hashedPin) {
    const isSamePin = await verifyPin(newPin, user.hashedPin);
    if (isSamePin) {
      throw new ApiError(
        400,
        "PIN_SAME_AS_OLD",
        "New PIN must be different from current PIN",
      );
    }
  }

  const hashedPin = await hashPin(newPin);

  await prismaPostgres.$transaction(async (tx) => {
    await tx.user.update({
      where: { id: userId },
      data: { hashedPin },
    });

    const wallet = await tx.wallet.findUnique({
      where: { userId },
      select: { status: true },
    });
    if (wallet?.status === "PENDING_PIN") {
      await tx.wallet.update({
        where: { userId },
        data: { status: "PENDING_KYC" },
      });
    }
  });

  await redis.del(RedisKeys.OTP_PIN_RESET(userId));
  await clearOtpTracking(OTP_SCOPE, identifier);
};
