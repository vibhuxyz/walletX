import { Logger } from "@repo/libs";
import * as accountService from "../services/account.service.js";
import type { Request, Response } from "express";
import { DeviceInfo } from "@repo/types";

const logger = new Logger("account.controller");

export const getAvailableBanks = async (req: Request, res: Response) => {
  logger.info("Get available banks");

  const banks = await accountService.getAvailableBanks();

  res.json({
    success: true,
    data: { banks },
    meta: {
      requestId: req.requestId!,
      timestamp: new Date().toISOString(),
    },
  });
};

export const getLinkedAccounts = async (req: Request, res: Response) => {
  const userId = req.user?.userId!;

  logger.info("Get linked accounts", { userId });

  const accounts = await accountService.getLinkedAccounts(userId);

  res.json({
    success: true,
    data: { accounts },
    meta: {
      requestId: req.requestId!,
      timestamp: new Date().toISOString(),
    },
  });
};

export const initiateBankLink = async (req: Request, res: Response) => {
  const userId = req.user?.userId!;

  const { bankName, accountNumber, ifscCode, accountHolder, accountType } =
    req.body;

  logger.info("Initiating bank link for user", {
    userId,
    bankName,
    accountNumber,
  });

  const resut = await accountService.initiateBankLink(userId, {
    bankName,
    accountNumber,
    ifscCode,
    accountHolder,
    accountType,
  });

  res.json({
    success: true,
    data: resut,

    meta: {
      requestId: req.requestId!,
      timestamp: new Date().toISOString(),
    },
  });
};

export const verifyPinAndSendOTP = async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const { linkToken, pin } = req.body;

  logger.info("Verify PIN for bank link", { userId });

  const result = await accountService.verifyPinAndSendOTP(
    userId,
    linkToken,
    pin,
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

export const confirmBankLink = async (req: Request, res: Response) => {
  const userId = req.user?.userId!;

  const { linkToken, otp } = req.body;
  logger.info("Confirm bank link", { userId });

  const result = await accountService.confirmBankLink(userId, linkToken, otp);

  res.json({
    success: true,
    data: result,
    meta: {
      requestId: req.requestId!,
      timestamp: new Date().toISOString(),
    },
  });
};

export const createBankAccount = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const userId = req.user!.userId;
  const input = req.body;

  logger.info("Creating bank account", { userId });

  const account = await accountService.createBankAccount(userId, input);

  res.status(201).json({
    success: true,
    data: account,
    meta: {
      requestId: req.requestId!,
      timestamp: new Date().toISOString(),
    },
  });
};

export const getUserBankAccounts = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const userId = req.user!.userId;

  logger.info("Fetching user bank accounts", { userId });

  const accounts = await accountService.getUserBankAccounts(userId);

  res.json({
    success: true,
    data: {
      accounts,
      count: accounts.length,
    },
    meta: {
      requestId: req.requestId!,
      timestamp: new Date().toISOString(),
    },
  });
};

export const getBankAccountDetails = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const userId = req.user!.userId;
  const { accountId } = req.params;

  logger.info("Fetching bank account details", { userId, accountId });

  const account = await accountService.getBankAccountDetails(
    userId,
    accountId as string,
  );

  res.json({
    success: true,
    data: account,
    meta: {
      requestId: req.requestId!,
      timestamp: new Date().toISOString(),
    },
  });
};
