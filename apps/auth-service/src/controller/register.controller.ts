import { ApiError, ErrorCodes, Logger } from "@repo/libs";

import { Response, Request } from "express";
import * as authService from "../services/auth.service.js";
import * as tokenService from "../services/token.service.js";

const logger = new Logger("RegisterController");

export const registerUser = async (req: Request, res: Response) => {
  const deviceInfo = req.deviceInfo!;

  logger.info("Customer registration attempt", { email: req.body.email });

  //@ts-ignore
  const result = await authService.registerUser(req.body, "USER", deviceInfo);

  res.status(201).json({
    success: true,
    data: {
      email: result.email,
      otpSentTo: "email",
      expiresIn: 600,
    },
    meta: {
      requestId: req.requestId!,
      timestamp: new Date().toISOString(),
    },
  });
};

export const registerBankAdmin = async (req: Request, res: Response) => {
  const deviceInfo = req.deviceInfo!;

  logger.info("Bank admin registration attempt", { email: req.body.email });

  //@ts-ignore
  const result = await authService.registerUser(req.body, "BANK_ADMIN", deviceInfo);

  res.status(201).json({
    success: true,
    data: {
      email: result.email,
      otpSentTo: "email",
      expiresIn: 600,
    },
    meta: {
      requestId: req.requestId!,
      timestamp: new Date().toISOString(),
    },
  });
};

export const verifyEmail = async (req: Request, res: Response) => {
  const deviceInfo = req.deviceInfo!;

  if (!req.deviceInfo) {
    throw new ApiError(
      400,
      ErrorCodes.VALIDATION_ERROR,
      "Device information is required",
    );
  }

  logger.info("Email verification attempt", { email: req.body.email });

  const result = await authService.verifyEmailAndCreateUser(
    req.body.email,
    req.body.otp,
    //@ts-ignore
    deviceInfo,
  );

  tokenService.setAuthCookies(res, result.tokens, "USER");

  res.json({
    success: true,
    data: {
      userId: result.user.id,
      email: result.user.email,
      role: result.user.role,
      fullName: result.user.fullName,
      requiresPinSetup: true,
      ...("wallet" in result.user
        ? {
            wallet: {
              id: result.user.wallet.id,
              status: result.user.wallet.status,
              qrCode: result.user.wallet.qrCode,
            },
          }
        : {}),
      meta: {
        requestId: req.requestId!,
        timestamp: new Date().toISOString(),
      },
    },
  });
};

export const resendOTP = async (req: Request, res: Response) => {
  const { email } = req.body;
  logger.info("Resending OTP", { email });

  await authService.resendVerificationOTP(email);

  res.json({
    success: true,
    data: {
      message: "OTP sent successfully",
    },
    meta: {
      requestId: req.requestId,
      timestamp: new Date().toISOString(),
    },
  });
};
