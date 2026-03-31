import { ENV } from "@repo/config";
import { Logger } from "@repo/libs";
import * as debitService from "../services/debit.service.js";
import { Request, Response } from "express";

const logger = new Logger("DebitController");

export const debitAccount = async (req: Request, res: Response) => {
  const apiKey = req.headers["x-api-key"];

  if (apiKey !== ENV.WALLET_SERVICE_API_KEY) {
    res.status(401).json({
      success: false,
      error: {
        code: "UNAUTHORIZED",
        message: "Invalid API key",
      },
    });
    return;
  }

  const { accountId, amount, referenceId } = req.body;

  logger.info("Bank debit request", { accountId, amount, referenceId });

  const result = await debitService.debitAccount(
    accountId,
    amount,
    referenceId,
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
