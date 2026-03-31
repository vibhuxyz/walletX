import {
  asyncHandler,
  authMiddleware,
  requireRole,
  validate,
} from "@repo/http";
import * as kycController from "../controllers/kyc.controller.js";
import { activateWalletSchema } from "@repo/zod-schema";
import { Router } from "express";

const router: Router = Router();

router.post(
  "/kyc-submit",
  authMiddleware,
  requireRole("USER"),
  validate(activateWalletSchema),
  asyncHandler(kycController.submitKyc),
);

export default router;
