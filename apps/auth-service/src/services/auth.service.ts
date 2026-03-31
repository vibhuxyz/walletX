import { prismaPostgres } from "@repo/db-postgres";
import { ApiError, ErrorCodes, verifyOTP } from "@repo/libs";
import { nanoid } from "nanoid";
import * as tokenService from "../services/token.service.js";
import {
  generateOTP,
  generateWalletHandle,
  generateQRCode,
  hashOTP,
  hashPassword,
  Logger,
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
import { DeviceInfo } from "@repo/types";

const logger = new Logger("AuthService");
const OTP_SCOPE = "email-verify";
const OTP_MAX_REQUESTS = 2;
const OTP_MAX_ATTEMPTS = 5;

const buildUniqueWalletHandle = async (
  tx: any,
  email: string,
  fullName: string,
) => {
  const base = generateWalletHandle(email || fullName);
  let candidate = base;

  for (let attempt = 0; attempt < 6; attempt++) {
    const existing = await tx.wallet.findUnique({
      where: { qrCode: candidate },
      select: { id: true },
    });

    if (!existing) {
      return candidate;
    }

    const handlePrefix = base.split("@")[0];
    candidate = `${handlePrefix}-${nanoid(4).toLowerCase()}@wallet`;
  }

  return generateQRCode("WALLET");
};

interface RegisterInput {
  fullName: string;
  email: string;
  phone: string;
  password: string;
}

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

export const registerUser = async (
  input: RegisterInput,
  userType: "USER" | "MERCHANT" | "BANK_ADMIN",
  deviceInfo: DeviceInfo,
) => {
  const identifier = input.email.toLowerCase();

  await enforceOtpRequestRestrictions(identifier);
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

  // Check if email/phone already exists

  const existingUser = await prismaPostgres.user.findFirst({
    where: {
      OR: [{ email: input.email }, { phone: input.phone }],
    },
    select: { email: true, phone: true },
  });

  if (existingUser) {
    if (existingUser.email === input.email) {
      throw new ApiError(400, "EMAIL_EXISTS", "Email already registered");
    }

    throw new ApiError(400, "PHONE_EXISTS", "Phone already registered");
  }

  const otp = generateOTP(6);
  const [hashedOtp, hashedPassword] = await Promise.all([
    hashOTP(otp),
    hashPassword(input.password)
  ]);

  await redis.set(
    RedisKeys.OTP_EMAIL_VERIFY(identifier),
    JSON.stringify({
      hashedOtp,
      email: identifier,
      phone: input.phone,
      fullName: input.fullName,
      hashedPassword,
      userType,
      deviceId: deviceInfo.deviceId,
      deviceName: deviceInfo.deviceName,
      ipAddress: deviceInfo.ip,
      attempts: 0,
      createdAt: new Date().toISOString(),
    }),
    "EX",
    RedisTTL.OTP_EMAIL,
  );

  await publishMessage(
    Exchanges.NOTIFICATIONS,
    RoutingKeys.EMAIL_VERIFICATION,
    {
      to: identifier,
      template: "email-verification",
      data: {
        name: input.fullName,
        otp,
        expiryMinutes: 2,
      },
    },
  );

  logger.info("Registeration initated", { email: identifier, userType });
  return { email: identifier };
};

export interface AuthResponse {
  user: {
    id: string;
    email: string;
    role: string;
    fullName: string;
    wallet?: any;
  };
  tokens: {
    accessToken: string;
    refreshTokenId: string; // Changed from refreshToken
    csrfToken: string; // Added
    sessionId: string; // Added
  };
}

export const verifyEmailAndCreateUser = async (
  email: string,
  otp: string,
  deviceInfo: DeviceInfo,
): Promise<AuthResponse> => {
  const identifier = email.toLowerCase();
  const restrictions = await getOtpRestrictions(OTP_SCOPE, identifier);
  if (restrictions.isLocked) {
    throw new ApiError(
      429,
      ErrorCodes.OTP_LOCKED,
      "Account locked due to multiple failed attempts. Try again after 30 minutes.",
    );
  }

  const sessionData = await redis.get(RedisKeys.OTP_EMAIL_VERIFY(identifier));

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
      await redis.del(RedisKeys.OTP_EMAIL_VERIFY(identifier));
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

  await redis.del(RedisKeys.OTP_EMAIL_VERIFY(identifier));
  await clearOtpTracking(OTP_SCOPE, identifier);

  // now create user
  const result = await prismaPostgres.$transaction(async (tx) => {
    // create user
    const user = await tx.user.create({
      data: {
        id: `usr_${nanoid(21)}`,
        email: session.email,
        phone: session.phone,
        fullName: session.fullName,
        hashedPassword: session.hashedPassword,
        role: session.userType,
        isEmailVerified: true,
        isActive: true,
      },
      select: { id: true, email: true, role: true, fullName: true },
    });

    // Create wallet for CUSTOMER
    if (session.userType === "USER") {
      const walletHandle = await buildUniqueWalletHandle(
        tx,
        session.email,
        session.fullName,
      );

      const wallet = await tx.wallet.create({
        data: {
          id: `wal_${nanoid(21)}`,
          userId: user.id,
          balance: BigInt(0),
          status: "PENDING_PIN",
          isFrozen: true,
          qrCode: walletHandle,
          version: 0,
        },
      });

      return { ...user, wallet };
    }
    return user;
  });

  // Mark device as trusted
  await prismaPostgres.trustedDevice.create({
    data: {
      id: `dev_${nanoid(21)}`,
      userId: result.id,
      deviceId: deviceInfo.deviceId,
      deviceName: deviceInfo.deviceName,
      ipAddress: deviceInfo.ip,
      isTrusted: true,
    },
  });

  // Generate tokens
  const tokens = await tokenService.issueTokens({
    userId: result.id,
    email: result.email,
    role: result.role,
    deviceId: deviceInfo.deviceId,
    deviceName: deviceInfo.deviceName,
  });
  logger.info("User created successfully", {
    userId: result.id,
    role: result.role,
  });

  return { user: result, tokens };
};

export const resendVerificationOTP = async (email: string) => {
  const identifier = email.toLowerCase();
  await enforceOtpRequestRestrictions(identifier);
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

  const registrationData = await redis.get(
    RedisKeys.OTP_EMAIL_VERIFY(identifier),
  );

  if (!registrationData) {
    throw new ApiError(
      404,
      "NO_PENDING_VERIFICATION",
      "No pending verification for this email",
    );
  }

  const data = JSON.parse(registrationData);
  const otp = generateOTP(6);
  const hashedOtp = await hashOTP(otp);

  data.hashedOtp = hashedOtp;
  data.attempts = 0;

  await redis.set(
    RedisKeys.OTP_EMAIL_VERIFY(identifier),
    JSON.stringify(data),
    "EX",
    RedisTTL.OTP_EMAIL,
  );

  await publishMessage(
    Exchanges.NOTIFICATIONS,
    RoutingKeys.EMAIL_VERIFICATION,
    {
      to: identifier,
      template: "email-verification",
      data: {
        name: data.fullName,
        otp: otp,
        expiryMinutes: 2,
      },
    },
  );

  logger.info("OTP resent", { email: identifier });
};
