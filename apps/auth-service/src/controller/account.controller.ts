import { Logger } from "@repo/libs";
import { Request, Response } from "express";
import * as accountService from "../services/account.service.js";
import * as tokenService from "../services/token.service.js";

const logger = new Logger("account.controller");

export const requestDeleteAccountOtp = async (req: Request, res: Response) => {
  const userId = req.user!.userId;

  logger.info("Delete account OTP request", { userId });

  await accountService.requestDeleteAccountOtp(userId);

  res.json({
    success: true,
    data: {
      message: "Delete account OTP sent to your email",
      otpSentTo: "email",
      expiresIn: 600,
    },
    meta: {
      requestId: req.requestId!,
      timestamp: new Date().toISOString(),
    },
  });
};

export const resendDeleteAccountOtp = async (req: Request, res: Response) => {
  const userId = req.user!.userId;

  logger.info("Resend delete account OTP request", { userId });

  await accountService.resendDeleteAccountOtp(userId);

  res.json({
    success: true,
    data: {
      message: "Delete account OTP resent",
      otpSentTo: "email",
      expiresIn: 600,
    },
    meta: {
      requestId: req.requestId!,
      timestamp: new Date().toISOString(),
    },
  });
};

export const confirmDeleteAccount = async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const role = req.user!.role;
  const { otp } = req.body;

  logger.info("Confirm delete account request", { userId });

  await accountService.deleteAccountWithOtp(userId, otp);
  tokenService.clearAuthCookies(res, role);

  res.json({
    success: true,
    data: {
      message: "Account deleted successfully",
    },
    meta: {
      requestId: req.requestId!,
      timestamp: new Date().toISOString(),
    },
  });
};
