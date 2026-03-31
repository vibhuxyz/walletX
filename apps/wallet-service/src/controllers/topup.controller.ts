import { Request, Response } from "express";
import * as topupService from "../services/topup.service.js";
import { Logger } from "@repo/libs";

const logger = new Logger("TopupController");

const setReadResponseMetadata = (
  res: Response,
  startedAt: number,
  cacheControl: string,
) => {
  const durationMs = Number((Date.now() - startedAt).toFixed(1));
  res.setHeader("Cache-Control", cacheControl);
  res.setHeader("Server-Timing", `app;dur=${durationMs}`);
};

export const initiateTopup = async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const { linkedAccountId, amount } = req.body;

  const idempotencyKey = req.headers["idempotency-key"] as string;

  logger.info("Initiate topup", { userId, linkedAccountId, amount });

  const result = await topupService.initiateTopup(
    userId,
    linkedAccountId,
    amount,
    idempotencyKey,
  );

  res.json({
    success: true,
    data: result,
    meta: {
      requestId: req.requestId!,
      timestamp: new Date().toISOString(),
    },
  });
};

export const verifyPinAndSendOTP = async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const { orderId, pin } = req.body;

  logger.info("Verify PIN for topup", { userId, orderId });

  const result = await topupService.verifyPinAndSendOTP(userId, orderId, pin);

  res.json({
    success: true,
    data: result,
    meta: {
      requestId: req.requestId!,
      timestamp: new Date().toISOString(),
    },
  });
};

export const confirmTopupOTP = async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const { orderId, otp } = req.body;

  logger.info("Confirm topup OTP", { userId, orderId });

  const result = await topupService.confirmTopupOTP(userId, orderId, otp);

  res.json({
    success: true,
    data: result,
    meta: {
      requestId: req.requestId!,
      timestamp: new Date().toISOString(),
    },
  });
};

export const getTopupStatus = async (req: Request, res: Response) => {
  const startedAt = Date.now();
  const userId = req.user!.userId;
  const { orderId } = req.params;

  if (typeof orderId !== "string") {
    return res.status(400).json({
      success: false,
      message: "Invalid or missing orderId",
    });
  }

  logger.info("Get topup status", { userId, orderId });

  const result = await topupService.getTopupStatus(userId, orderId);

  setReadResponseMetadata(
    res,
    startedAt,
    "private, max-age=0, stale-while-revalidate=10",
  );

  res.json({
    success: true,
    data: result,
    meta: {
      requestId: req.requestId!,
      timestamp: new Date().toISOString(),
    },
  });
};
