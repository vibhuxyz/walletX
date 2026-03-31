import { Router } from "express";
import { asyncHandler, authMiddleware, requireRole, validate } from "@repo/http";
import { deleteAccountOtpSchema } from "@repo/zod-schema";
import * as accountController from "../controller/account.controller.js";

const router: Router = Router();

router.post(
  "/delete-account/request-otp",
  authMiddleware,
  requireRole("USER", "MERCHANT"),
  asyncHandler(accountController.requestDeleteAccountOtp),
);

router.post(
  "/delete-account/resend-otp",
  authMiddleware,
  requireRole("USER", "MERCHANT"),
  asyncHandler(accountController.resendDeleteAccountOtp),
);

router.post(
  "/delete-account/confirm",
  authMiddleware,
  requireRole("USER", "MERCHANT"),
  validate(deleteAccountOtpSchema),
  asyncHandler(accountController.confirmDeleteAccount),
);

export default router;
