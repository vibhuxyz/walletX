//get userif from req
// get body

import { Logger } from "@repo/libs";
import { validateTransferSchema } from "@repo/zod-schema";
import type { Request, Response } from "express";
import * as transferService from "../services/transfer.service.js";
import { redis, RedisKeys } from "@repo/redis";

const logger = new Logger("transfer-controller");

// send to transfer service
export const validateTransfer = async (req: Request, res: Response) => {
  const userId = req.user!.userId;

  
  const { amount, recipient, note } = req.body;

  logger.info("Validate transfer", { userId, recipient, amount });

  const result = await transferService.validateP2PTransfer(
    userId,
    amount,
    recipient,
    note,
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

export const confirmTransfer = async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const { transferId, pin } = req.body;
  const idempotencyKey = req.headers["idempotency-key"] as string;

  logger.info("Confirm transfer", { userId, transferId });

  const result = await transferService.confirmP2PTransfer(
    userId,
    transferId,
    pin,
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
