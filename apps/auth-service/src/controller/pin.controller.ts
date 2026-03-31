import { ApiError, Logger } from "@repo/libs";
import { Request, Response } from "express";

import * as pinService from "../services/pin.service.js";

const logger = new Logger("Setup pin");

export async function setPin(req: Request, res: Response): Promise<void> {
  const userId = req.user!.userId;

  const { pin, confirmPin } = req.body;

  logger.info("PIN setup attempt", { userId });

  if (pin !== confirmPin) {
    throw new ApiError(400, "PIN_MISMATCH", "PINs don't match");
  }

  await pinService.setWalletPin(userId, pin);

  res.json({
    success: true,
    data: {
      message: "PIN set successfully",
      walletStatus: "PENDING_KYC",
    },
    meta: {
      requestId: req.requestId!,
      timestamp: new Date().toISOString(),
    },
  });
}

export async function removePin(req: Request, res: Response): Promise<void> {
  const userId = req.user!.userId;

  logger.info("PIN removal attempt", { userId });

  await pinService.removeWalletPin(userId);

  res.json({
    success: true,
    data: {
      message: "PIN removed successfully. Wallet locked until new PIN is set.",
      walletStatus: "PENDING_PIN",
    },
    meta: {
      requestId: req.requestId!,
      timestamp: new Date().toISOString(),
    },
  });
}

export async function changePin(req: Request, res: Response): Promise<void> {
  const userId = req.user!.userId;
  const { currentPin, newPin } = req.body;

  logger.info("PIN change attempt", { userId });

  await pinService.changeWalletPin(userId, currentPin, newPin);

  res.json({
    success: true,
    data: {
      message: "PIN changed successfully",
    },
    meta: {
      requestId: req.requestId!,
      timestamp: new Date().toISOString(),
    },
  });
}

export async function forgotPin(req: Request, res: Response): Promise<void> {
  const userId = req.user!.userId;

  logger.info("Forgot PIN OTP request", { userId });

  await pinService.requestForgotPinOtp(userId);

  res.json({
    success: true,
    data: {
      message: "PIN reset OTP sent to your email",
      otpSentTo: "email",
      expiresIn: 600,
    },
    meta: {
      requestId: req.requestId!,
      timestamp: new Date().toISOString(),
    },
  });
}

export async function resendForgotPinOtp(
  req: Request,
  res: Response,
): Promise<void> {
  const userId = req.user!.userId;

  logger.info("Resend forgot PIN OTP request", { userId });

  await pinService.resendForgotPinOtp(userId);

  res.json({
    success: true,
    data: {
      message: "PIN reset OTP resent successfully",
      otpSentTo: "email",
      expiresIn: 600,
    },
    meta: {
      requestId: req.requestId!,
      timestamp: new Date().toISOString(),
    },
  });
}

export async function resetPin(req: Request, res: Response): Promise<void> {
  const userId = req.user!.userId;
  const { otp, newPin } = req.body;

  logger.info("Reset PIN with OTP request", { userId });

  await pinService.resetPinWithOtp(userId, otp, newPin);

  res.json({
    success: true,
    data: {
      message: "PIN reset successfully",
    },
    meta: {
      requestId: req.requestId!,
      timestamp: new Date().toISOString(),
    },
  });
}
