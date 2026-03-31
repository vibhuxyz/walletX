import { Logger } from "@repo/libs";
import * as loginService from "../services/login.service.js";
import * as tokenService from "../services/token.service.js";
import { Request, Response } from "express";

const logger = new Logger("LoginController");

export const userLogin = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const deviceInfo = req.deviceInfo!;

  logger.info("Customer login attempt", { email });

  const result = await loginService.loginUser(
    email,
    password,
    deviceInfo,
    "USER",
  );

  if (result.status === "OTP_REQUIRED") {
    res.json({
      success: true,
      data: {
        status: "OTP_REQUIRED",
        email,
        maskedEmail: email.replace(/(.{2})(.*)(@.*)/, "$1***$3"),
        otpSentTo: "email",
        expiresIn: 300,
      },
      meta: {
        requestId: req.requestId!,
        timestamp: new Date().toISOString(),
      },
    });
    return;
  }

  tokenService.setAuthCookies(res, result.tokens!, "USER");

  res.json({
    success: true,
    data: {
      status: "SUCCESS",
      user: result.user,
    },
    meta: {
      requestId: req.requestId!,
      timestamp: new Date().toISOString(),
    },
  });
};

export const verifyCustomerLoginOtp = async (req: Request, res: Response) => {
  const { email, otp } = req.body;
  const deviceInfo = req.deviceInfo!;
  logger.info("Customer OTP verification", { email });

  const result = await loginService.verifyLoginOtp(
    email,
    otp,
    deviceInfo,
    "USER",
  );

  tokenService.setAuthCookies(res, result.tokens, "USER");
  res.json({
    success: true,
    data: {
      status: "SUCCESS",
      user: result.user,
    },
    meta: {
      requestId: req.requestId!,
      timestamp: new Date().toISOString(),
    },
  });
};

export const resendCustomerLoginOtp = async (req: Request, res: Response) => {
  const { email } = req.body;
  const deviceInfo = req.deviceInfo!;

  logger.info("Customer OTP resend request", { email });

  const result = await loginService.resendLoginOtp(email, deviceInfo, "USER");

  res.json({
    success: true,
    data: {
      message: "OTP resent successfully",
      email: result.email,
      otpSentTo: "email",
      expiresIn: result.expiresIn,
    },
    meta: {
      requestId: req.requestId!,
      timestamp: new Date().toISOString(),
    },
  });
};

export const refreshToken = async (req: Request, res: Response) => {
  const { role } = req.params;
  const deviceInfo = req.deviceInfo!;

  const token = tokenService.getTokensFromRequest(
    req,
    (role as string).toUpperCase(),
  );

  if (!token.refreshToken) {
    res.status(401).json({
      success: false,
      error: {
        code: "REFRESH_TOKEN_REQUIRED",
        message: "Refresh token required",
      },
      meta: {
        requestId: req.requestId!,
        timestamp: new Date().toISOString(),
      },
    });

    return;
  }

  const newToken = await tokenService.rotateTokens(
    token.refreshToken,
    deviceInfo.deviceId,
  );

  tokenService.setAuthCookies(res, newToken, (role as string).toUpperCase());

  res.json({
    success: true,
    data: {
      message: "Token refreshed successfully",
    },
    meta: {
      requestId: req.requestId,
      timestamp: new Date().toISOString(),
    },
  });
};

export const getCurrentUser = async (req: Request, res: Response) => {
  const { role } = req.params;
  const userId = req.user!.userId;

  logger.info("Get current user", { userId, role });

  const user = await loginService.getProfile(
    userId,
    (role as string).toUpperCase(),
  );

  res.json({
    success: true,
    data: user,
    meta: {
      requestId: req.requestId!,
      timestamp: new Date().toISOString(),
    },
  });
};

export const logOut = async (req: Request, res: Response) => {
  const { role } = req.params;

  const user = req.user!;

  const roleString =
    (Array.isArray(role) ? role[0] : role)?.toUpperCase() || "USER";

  const token = tokenService.getTokensFromRequest(req, roleString);

  if (token.refreshToken) {
    await tokenService.revokeSession(token.refreshToken, user.sessionId);
  }

  tokenService.clearAuthCookies(res, roleString);

  res.json({
    success: true,
    data: {
      message: "Logged out successfully",
    },
    meta: {
      requestId: req.requestId!,
      timestamp: new Date().toISOString(),
    },
  });
};
