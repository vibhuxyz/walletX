import {
  asyncHandler,
  authMiddleware,
  idempotencyMiddleware,
  requireRole,
  validate,
} from "@repo/http";
import { Router } from "express";
import * as topupController from "../controllers/topup.controller.js";
import {
  confirmTopupSchema,
  initiateTopupSchema,
  verifyPinTopupSchema,
} from "@repo/zod-schema";
const router: Router = Router();

router.post(
  "/topup/initiate",
  authMiddleware,
  requireRole("USER"),
  idempotencyMiddleware,
  validate(initiateTopupSchema),
  asyncHandler(topupController.initiateTopup),
);
router.post(
  "/topup/verify-pin",
  authMiddleware,
  requireRole("USER"),

  validate(verifyPinTopupSchema),
  asyncHandler(topupController.verifyPinAndSendOTP),
);

//  Confirm OTP and trigger bank debit
router.post(
  "/topup/confirm",
  authMiddleware,
  requireRole("USER"),
  validate(confirmTopupSchema),
  asyncHandler(topupController.confirmTopupOTP),
);

// Get topup order status
router.get(
  "/topup/:orderId",
  authMiddleware,
  requireRole("USER"),
  asyncHandler(topupController.getTopupStatus),
);

export default router;
