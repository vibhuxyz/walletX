import { Logger } from "@repo/libs";
import { Request, Response } from "express";
import * as walletService from "../services/wallet.service.js";

const logger = new Logger("wallet.controller");

const setReadResponseMetadata = (
  res: Response,
  startedAt: number,
  cacheControl: string,
) => {
  const durationMs = Number((Date.now() - startedAt).toFixed(1));
  res.setHeader("Cache-Control", cacheControl);
  res.setHeader("Server-Timing", `app;dur=${durationMs}`);
};

export const getBalance = async (req: Request, res: Response) => {
  const startedAt = Date.now();
  const userId = req.user!.userId;

  logger.debug("Get wallet balance", { userId });

  const result = await walletService.getWalletBalance(userId);

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

export const getDashboard = async (req: Request, res: Response) => {
  const startedAt = Date.now();
  const userId = req.user!.userId;

  logger.debug("Get wallet dashboard", { userId });

  const result = await walletService.getDashboard(userId);

  setReadResponseMetadata(
    res,
    startedAt,
    "private, max-age=0, stale-while-revalidate=15",
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

export const getRecipients = async (req: Request, res: Response) => {
  const startedAt = Date.now();
  const userId = req.user!.userId;
  const result = await walletService.getRecentRecipients(userId);

  setReadResponseMetadata(
    res,
    startedAt,
    "private, max-age=0, stale-while-revalidate=30",
  );

  res.json({
    success: true,
    data: result,
  });
};

export const getTransactions = async (req: Request, res: Response) => {
  const startedAt = Date.now();
  const userId = req.user!.userId;

  const { cursor, limit, type, startDate, endDate } = req.query;

  logger.debug("Get transactions", { userId, cursor, limit, type });

  const result = await walletService.getTransactionHistory({
    userId,
    cursor: cursor as string,
    limit: limit ? parseInt(limit as string) : undefined,
    type: type as string,
    startDate: startDate ? new Date(startDate as string) : undefined,
    endDate: endDate ? new Date(endDate as string) : undefined,
  });

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

export const withdrawToBankAccount = async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const { linkedAccountId, amount, pin, note } = req.body;
  const idempotencyKey = req.headers["idempotency-key"] as string;

  logger.info("Withdraw to bank account request", {
    userId,
    linkedAccountId,
    amount,
  });

  const result = await walletService.withdrawToBankAccount({
    userId,
    linkedAccountId,
    amount,
    pin,
    note,
    idempotencyKey,
  });

  res.json({
    success: true,
    data: result,
    meta: {
      requestId: req.requestId!,
      timestamp: new Date().toISOString(),
    },
  });
};
