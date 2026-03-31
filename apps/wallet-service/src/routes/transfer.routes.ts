import {
  asyncHandler,
  authMiddleware,
  idempotencyMiddleware,
  requireRole,
  validate,
} from "@repo/http";
import { Router } from "express";
import { confirmTransferSchema, validateTransferSchema } from "@repo/zod-schema";
import * as transferController from "../controllers/transfer.controller.js";

const router: Router = Router();

router.post(
  "/transfer-validate",
  authMiddleware,
  requireRole("USER"),
  validate(validateTransferSchema),
  asyncHandler(transferController.validateTransfer),
);

router.post(
  "/transfer/confirm",
  authMiddleware,
  requireRole("USER"),
  idempotencyMiddleware,
  validate(confirmTransferSchema),
  asyncHandler(transferController.confirmTransfer),
);

export default router;
