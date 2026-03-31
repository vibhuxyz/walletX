import { Logger } from "@repo/libs";
import { Request, Response } from "express";
import * as kycService from "../services/kyc.service.js";
import { ActivateWalletInput } from "@repo/zod-schema";


const logger = new Logger("kyc.controller");

export const submitKyc = async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const kycData: ActivateWalletInput = req.body;

  logger.info("KYC Submission", {
    userId,
    idType: kycData.idType,
    hasIdNumber: !!kycData.idNumber,
  });

  const result = await kycService.submitKyc(userId, kycData);

  res.json({
    success: true,
    data: {
      kycStatus: result.kycStatus,
      walletStatus: result.walletStatus,
      message: result.message,
    },
    meta: {
      requestId: req.requestId!,
      timestamp: new Date().toISOString(),
    },
  });
};
