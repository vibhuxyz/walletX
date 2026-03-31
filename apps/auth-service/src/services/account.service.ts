import { prismaPostgres } from "@repo/db-postgres";
import {
  ApiError,
  Currency,
  ErrorCodes,
  generateOTP,
  hashOTP,
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
import * as tokenService from "./token.service.js";

const logger = new Logger("account.service");

const OTP_SCOPE = "account-delete";
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

const loadActiveUser = async (userId: string) => {
  const user = await prismaPostgres.user.findUnique({
    where: { id: userId },
    select: { email: true, fullName: true, isActive: true },
  });

  if (!user) {
    throw new ApiError(404, "USER_NOT_FOUND", "User not found");
  }

  if (!user.isActive) {
    throw new ApiError(
      400,
      "ACCOUNT_ALREADY_DEACTIVATED",
      "Account is already deactivated",
    );
  }

  return user;
};

const ensureWalletBalanceIsZero = async (userId: string) => {
  const wallet = await prismaPostgres.wallet.findUnique({
    where: { userId },
    select: { balance: true },
  });

  if (wallet && wallet.balance > 0n) {
    throw new ApiError(
      400,
      "WALLET_BALANCE_NOT_ZERO",
      "Withdraw your wallet balance to a linked bank account before deleting account.",
      {
        currentBalance: Currency.toRupees(wallet.balance),
        nextAction: "Withdraw funds first from /dashboard/withdraw",
      },
    );
  }
};

export const requestDeleteAccountOtp = async (userId: string) => {
  const user = await loadActiveUser(userId);
  await ensureWalletBalanceIsZero(userId);
  const identifier = user.email.toLowerCase();

  await enforceOtpRequestRestrictions(identifier);
  await consumeOtpRequestSlot(identifier);

  const otp = generateOTP(6);
  const hashedOtp = await hashOTP(otp);

  await redis.set(
    RedisKeys.OTP_ACCOUNT_DELETE(userId),
    JSON.stringify({
      userId,
      email: identifier,
      hashedOtp,
      attempts: 0,
    }),
    "EX",
    RedisTTL.OTP_ACCOUNT_DELETE,
  );

  await publishMessage(
    Exchanges.NOTIFICATIONS,
    RoutingKeys.EMAIL_ACCOUNT_DELETE,
    {
      to: identifier,
      template: "account-delete",
      data: {
        name: user.fullName,
        otp,
        expiryMinutes: 10,
      },
    },
  );

  logger.info("Delete account OTP sent", { userId });
};

export const resendDeleteAccountOtp = async (userId: string) => {
  const sessionData = await redis.get(RedisKeys.OTP_ACCOUNT_DELETE(userId));
  if (!sessionData) {
    throw new ApiError(
      404,
      "NO_PENDING_ACCOUNT_DELETE",
      "No pending account delete request",
    );
  }

  const user = await loadActiveUser(userId);
  await ensureWalletBalanceIsZero(userId);
  const identifier = user.email.toLowerCase();

  await enforceOtpRequestRestrictions(identifier);
  await consumeOtpRequestSlot(identifier);

  const otp = generateOTP(6);
  const hashedOtp = await hashOTP(otp);
  const previousSession = JSON.parse(sessionData);

  await redis.set(
    RedisKeys.OTP_ACCOUNT_DELETE(userId),
    JSON.stringify({
      ...previousSession,
      hashedOtp,
      attempts: 0,
    }),
    "EX",
    RedisTTL.OTP_ACCOUNT_DELETE,
  );

  await publishMessage(
    Exchanges.NOTIFICATIONS,
    RoutingKeys.EMAIL_ACCOUNT_DELETE,
    {
      to: identifier,
      template: "account-delete",
      data: {
        name: user.fullName,
        otp,
        expiryMinutes: 10,
      },
    },
  );

  logger.info("Delete account OTP resent", { userId });
};

export const deleteAccountWithOtp = async (userId: string, otp: string) => {
  const sessionData = await redis.get(RedisKeys.OTP_ACCOUNT_DELETE(userId));
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
      await redis.del(RedisKeys.OTP_ACCOUNT_DELETE(userId));
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

  await prismaPostgres.$transaction(async (tx) => {
    const user = await tx.user.findUnique({
      where: { id: userId },
      select: { id: true, isActive: true },
    });

    if (!user) {
      throw new ApiError(404, "USER_NOT_FOUND", "User not found");
    }

    if (!user.isActive) {
      throw new ApiError(
        400,
        "ACCOUNT_ALREADY_DEACTIVATED",
        "Account is already deactivated",
      );
    }

    await tx.user.update({
      where: { id: userId },
      data: { isActive: false },
    });

    await tx.trustedDevice.deleteMany({
      where: { userId },
    });

    const wallet = await tx.wallet.findUnique({
      where: { userId },
      select: { id: true, balance: true },
    });

    if (wallet) {
      if (wallet.balance > 0n) {
        throw new ApiError(
          400,
          "WALLET_BALANCE_NOT_ZERO",
          "Withdraw your wallet balance to a linked bank account before deleting account.",
          {
            currentBalance: Currency.toRupees(wallet.balance),
            nextAction: "Withdraw funds first from /dashboard/withdraw",
          },
        );
      }

      await tx.wallet.update({
        where: { userId },
        data: {
          status: "CLOSED",
          isFrozen: true,
        },
      });
    }
  });

  await tokenService.revokeAllUserSessions(userId);
  await redis.del(RedisKeys.OTP_ACCOUNT_DELETE(userId));
  await clearOtpTracking(OTP_SCOPE, identifier);

  logger.info("Account deleted successfully", { userId });
};
