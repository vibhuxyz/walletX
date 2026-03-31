import { Logger } from "@repo/libs";
import { Request, Response } from "express";
import * as passwordService from "../services/password.service.js";

const logger = new Logger("password.controller");

export const forgotPassword = async (req: Request, res: Response) => {
  const { email } = req.body;
  logger.info("forgotPassword request", { email });

  await passwordService.sendPasswordResetOTP(email);

  res.json({
    success: true,
    data: {
      message:
        "If this email is registered, you will receive a password reset OTP.",
    },
    meta: {
      requestId: req.requestId!,
      timestamp: new Date().toISOString(),
    },
  });
};

export const resendForgotPasswordOtp = async (req: Request, res: Response) => {
  const { email } = req.body;
  logger.info("resend forgot password OTP request", { email });

  await passwordService.resendPasswordResetOTP(email);

  res.json({
    success: true,
    data: {
      message: "Password reset OTP resent successfully",
    },
    meta: {
      requestId: req.requestId!,
      timestamp: new Date().toISOString(),
    },
  });
};

export const resetPassword = async (req: Request, res: Response) => {
  const { email, otp, newPassword } = req.body;
  logger.info("resetPassword request", { email });

  await passwordService.resetPasswordWithOtp(email, otp, newPassword);

  res.json({
    success: true,
    data: {
      message: "Password reset successfully",
    },
    meta: {
      requestId: req.requestId!,
      timestamp: new Date().toISOString(),
    },
  });
};
