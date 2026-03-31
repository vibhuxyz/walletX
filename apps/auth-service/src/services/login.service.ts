import { prismaPostgres } from "@repo/db-postgres";
import {
  ApiError,
  Currency,
  ErrorCodes,
  generateOTP,
  hashOTP,
  Logger,
  verifyOTP,
  verifyPassword,
} from "@repo/libs";
import { DeviceInfo } from "@repo/types";
import * as deviceService from "./device.service.js";
import * as tokenService from "./token.service.js";
import {
  clearOtpTracking,
  getOtpRestrictions,
  redis,
  RedisKeys,
  RedisTTL,
  trackOtpFailure,
  trackOtpRequest,
} from "@repo/redis";
import { Exchanges, publishMessage, RoutingKeys } from "@repo/rabbitmq";
import { prismaMongo } from "@repo/db-mongo";
import { nanoid } from "nanoid";

const logger = new Logger("login.service");
const OTP_SCOPE = "login-otp";
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

export const loginUser = async (
  email: string,
  password: string,
  deviceInfo: DeviceInfo,
  expectedRole: string,
) => {
  const user = await prismaPostgres.user.findUnique({
    where: {
      email,
    },
    select: {
      id: true,
      email: true,
      role: true,
      fullName: true,
      hashedPassword: true,
      isActive: true,
      isEmailVerified: true,
    },
  });

  if (!user) {
    // Prevent timing attack
    const DUMMY_ARGON2_HASH = "$argon2d$v=18$m=65536,t=3,p=4$CgPLKDu5o1Jrr6nniTK72w$quSPtEUSpnEexDyp0B4OCsUxGut86LU+kLDcIN/WyHc";
    await verifyPassword(password, DUMMY_ARGON2_HASH); // dummy hash that won't match but takes time

    throw new ApiError(
      401,
      ErrorCodes.INVALID_CREDENTIALS,
      "Invalid email or password",
    );
  }

  // ✅ CHECK ROLE MATCHES

  if (user.role !== expectedRole) {
    throw new ApiError(
      403,
      "INVALID_ACCOUNT_TYPE",
      `This is a ${user.role.toLowerCase()} account. Please use the correct login page.`,
      {
        expectedRole,
        actualRole: user.role,
      },
    );
  }

  if (!user.isActive) {
    throw new ApiError(
      403,
      "ACCOUNT_SUSPENDED",
      "Account suspended. Contact support",
    );
  }

  if (!user.isEmailVerified) {
    throw new ApiError(
      403,
      "EMAIL_NOT_VERIFIED",
      "Please verify your email before logging in",
    );
  }

  // Verify password
  const isPasswordValid = await verifyPassword(password, user.hashedPassword);

  if (!isPasswordValid) {
    // Log failed attempt
    prismaMongo.loginAttempt
      .create({
        data: {
          email,
          ip: deviceInfo.ip,
          deviceId: deviceInfo.deviceId,
          deviceName: deviceInfo.deviceName,
          success: false,
          reason: "wrong_password",
          userAgent: deviceInfo.userAgent || "",
          timestamp: new Date(),
        },
      })
      .catch(() => {});

    throw new ApiError(
      401,
      ErrorCodes.INVALID_CREDENTIALS,
      "Invalid email or password",
    );
  }

  // Check if device is trusted
  const isTrusted = await deviceService.isDeviceTrusted(
    user.id,
    deviceInfo.deviceId,
    deviceInfo.ip,
  );

  if (isTrusted) {
    // Stage 1: Parallel cleanup and tracking
    await Promise.all([
      tokenService.revokeAllUserSessions(user.id),
      prismaPostgres.trustedDevice.updateMany({
        where: { userId: user.id, deviceId: deviceInfo.deviceId },
        data: { lastUsedAt: new Date() },
      }),
      prismaPostgres.user.update({
        where: { id: user.id },
        data: { lastLoginAt: new Date() },
      }),
    ]);

    // Stage 2: Parallel token issuance and profile fetching
    const [tokens, userProfile] = await Promise.all([
      tokenService.issueTokens({
        userId: user.id,
        email: user.email,
        role: user.role,
        deviceId: deviceInfo.deviceId,
        deviceName: deviceInfo.deviceName,
      }),
      getProfile(user.id, user.role),
    ]);

    // Log success
    prismaMongo.loginAttempt
      .create({
        data: {
          email,
          ip: deviceInfo.ip,
          deviceId: deviceInfo.deviceId,
          deviceName: deviceInfo.deviceName,
          success: true,
          reason: "trusted_device",
          userAgent: deviceInfo.userAgent || "",
          timestamp: new Date(),
        },
      })
      .catch(() => {});

    // User profile and tokens already fetched in parallel block above

    return { status: "SUCCESS" as const, user: userProfile, tokens };
  }

  // New device - send OTP
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

  const otp = generateOTP(6);
  const hashedOtp = await hashOTP(otp);

  await redis.set(
    RedisKeys.OTP_LOGIN(identifier, deviceInfo.deviceId),
    JSON.stringify({
      hashedOtp,
      userId: user.id,
      ip: deviceInfo.ip,
      deviceName: deviceInfo.deviceName,
      attempts: 0,
    }),
    "EX",
    RedisTTL.OTP_LOGIN,
  );

  // Send OTP
  await publishMessage(Exchanges.NOTIFICATIONS, RoutingKeys.EMAIL_LOGIN_OTP, {
    to: identifier,
    template: "login-verification",
    data: {
      name: user.fullName,
      otp,
      deviceName: deviceInfo.deviceName,
      ip: deviceInfo.ip,
      timestamp: new Date(),
    },
  });

  logger.info("Login OTP sent", { email, deviceId: deviceInfo.deviceId });
  logger.info("Checking trust for device", {
    userId: user.id,
    deviceId: deviceInfo.deviceId,
    ip: deviceInfo.ip,
  });

  return { status: "OTP_REQUIRED" as const };
};

export const verifyLoginOtp = async (
  email: string,
  otp: string,
  deviceInfo: DeviceInfo,
  expectedRole: string,
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

  const sessionData = await redis.get(
    RedisKeys.OTP_LOGIN(identifier, deviceInfo.deviceId),
  );
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
      await redis.del(RedisKeys.OTP_LOGIN(identifier, deviceInfo.deviceId));
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

  await redis.del(RedisKeys.OTP_LOGIN(identifier, deviceInfo.deviceId));
  await clearOtpTracking(OTP_SCOPE, identifier);

  const user = await prismaPostgres.user.findUnique({
    where: { id: session.userId },
    select: { id: true, email: true, role: true, fullName: true },
  });

  if (!user) {
    throw new ApiError(404, "USER_NOT_FOUND", "User not found");
  }

  if (user.role !== expectedRole) {
    throw new ApiError(403, "INVALID_ACCOUNT_TYPE", "Invalid account type");
  }

  await tokenService.revokeAllUserSessions(user.id);

  await prismaPostgres.trustedDevice.upsert({
    where: {
      userId_deviceId: { userId: user.id, deviceId: deviceInfo.deviceId },
    },
    create: {
      id: `dev_${nanoid(21)}`,
      userId: user.id,
      deviceId: deviceInfo.deviceId,
      deviceName: deviceInfo.deviceName,
      ipAddress: deviceInfo.ip,
      isTrusted: true,
    },
    update: {
      isTrusted: true,
      ipAddress: deviceInfo.ip,
      lastUsedAt: new Date(),
    },
  });

  await redis.del(RedisKeys.DEVICE_TRUST(user.id, deviceInfo.deviceId));

  await prismaPostgres.user.update({
    where: { id: user.id },
    data: { lastLoginAt: new Date() },
  });

  const tokens = await tokenService.issueTokens({
    userId: user.id,
    email: user.email,
    role: user.role,
    deviceId: deviceInfo.deviceId,
    deviceName: deviceInfo.deviceName,
  });

  const userProfile = await getProfile(user.id, user.role);
  logger.info("Login OTP verified", { userId: user.id });
  return { user: userProfile, tokens };
};

export const resendLoginOtp = async (
  email: string,
  deviceInfo: DeviceInfo,
  expectedRole: string,
) => {
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

  const sessionData = await redis.get(
    RedisKeys.OTP_LOGIN(identifier, deviceInfo.deviceId),
  );
  if (!sessionData) {
    throw new ApiError(
      404,
      "NO_PENDING_LOGIN_OTP",
      "No pending login verification for this email/device",
    );
  }

  const session = JSON.parse(sessionData);
  const user = await prismaPostgres.user.findUnique({
    where: { id: session.userId },
    select: { id: true, fullName: true, role: true },
  });
  if (!user) {
    throw new ApiError(404, "USER_NOT_FOUND", "User not found");
  }
  if (user.role !== expectedRole) {
    throw new ApiError(403, "INVALID_ACCOUNT_TYPE", "Invalid account type");
  }

  const otp = generateOTP(6);
  const hashedOtp = await hashOTP(otp);

  await redis.set(
    RedisKeys.OTP_LOGIN(identifier, deviceInfo.deviceId),
    JSON.stringify({
      ...session,
      hashedOtp,
      attempts: 0,
      ip: deviceInfo.ip,
      deviceName: deviceInfo.deviceName,
    }),
    "EX",
    RedisTTL.OTP_LOGIN,
  );

  await publishMessage(Exchanges.NOTIFICATIONS, RoutingKeys.EMAIL_LOGIN_OTP, {
    to: identifier,
    template: "login-verification",
    data: {
      name: user.fullName,
      otp,
      deviceName: deviceInfo.deviceName,
      ip: deviceInfo.ip,
      timestamp: new Date(),
    },
  });

  logger.info("Login OTP resent", { email: identifier });
  return { email: identifier, expiresIn: RedisTTL.OTP_LOGIN };
};

// get user profile on the basis of role
export const getProfile = async (userId: string, role: string) => {
  const user = await prismaPostgres.user.findUnique({
    where: {
      id: userId,
    },
    select: {
      id: true,
      email: true,
      phone: true,
      fullName: true,
      role: true,
      isEmailVerified: true,
      isActive: true,
      lastLoginAt: true,
      createdAt: true,
      ...(role === "USER" && {
        wallet: {
          select: {
            id: true,
            balance: true,
            status: true,
            isFrozen: true,
            qrCode: true,
          },
        },
        kycProfile: {
          select: {
            selfieUrl: true,
          },
        },
      }),
    },
  });

  if (!user) {
    throw new ApiError(404, "USER_NOT_FOUND", "User not found");
  }

  const response: any = {
    userId: user.id,
    email: user.email,
    phone: user.phone,
    fullName: user.fullName,
    role: user.role,
    isEmailVerified: user.isEmailVerified,
    isActive: user.isActive,
    lastLoginAt: user.lastLoginAt,
    createdAt: user.createdAt,
  };

  if (role === "USER") {
    // add waller info
    response.wallet = {
      id: user.wallet?.id,
      //@ts-ignore
      balance: Currency.toRupees(user.wallet?.balance),
      status: user.wallet?.status,
      isFrozen: user.wallet?.isFrozen,
      qrCode: user.wallet?.qrCode,
    };

    // add kyc profile with selfi url
    response.kycProfile = {
      selfieUrl: user.kycProfile?.selfieUrl || null,
    };
  }

  logger.info("User profile fetched", {
    userId,
    role,
    hasSelfie: !!user.kycProfile?.selfieUrl,
  });

  return response;
};
