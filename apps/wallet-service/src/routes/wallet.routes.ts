import {
  asyncHandler,
  authMiddleware,
  idempotencyMiddleware,
  requireRole,
  validate,
} from "@repo/http";
import { Router } from "express";
import { withdrawToBankSchema } from "@repo/zod-schema";
import * as walletController from "../controllers/wallet.controller.js";

const router: Router = Router();

router.get(
  "/balance",
  authMiddleware,
  requireRole("USER"),
  asyncHandler(walletController.getBalance),
);

router.get(
  "/transactions",
  authMiddleware,
  requireRole("USER"),
  asyncHandler(walletController.getTransactions),
);

router.get(
  "/dashboard",
  authMiddleware,
  requireRole("USER"),
  asyncHandler(walletController.getDashboard),
);

router.get(
  "/recipients",
  authMiddleware,
  asyncHandler(walletController.getRecipients),
);

router.post(
  "/withdraw",
  authMiddleware,
  requireRole("USER"),
  idempotencyMiddleware,
  validate(withdrawToBankSchema),
  asyncHandler(walletController.withdrawToBankAccount),
);

export default router;
