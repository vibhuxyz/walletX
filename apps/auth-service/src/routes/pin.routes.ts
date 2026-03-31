import {
  asyncHandler,
  authMiddleware,
  requireRole,
  validate,
} from "@repo/http";
import {
  changePinSchema,
  resetPinWithOtpSchema,
  setPinSchema,
} from "@repo/zod-schema";
import { Router } from "express";
import * as pinController from "../controller/pin.controller.js";
const router: Router = Router();

router.post(
  "/set-pin",
  authMiddleware,
  requireRole("USER", "MERCHANT"),
  validate(setPinSchema),
  asyncHandler(pinController.setPin),
);

router.delete(
  "/remove-pin",
  authMiddleware,
  requireRole("USER", "MERCHANT"),
  asyncHandler(pinController.removePin),
);

router.post(
  "/change-pin",
  authMiddleware,
  requireRole("USER", "MERCHANT"),
  validate(changePinSchema),
  asyncHandler(pinController.changePin),
);

router.post(
  "/forgot-pin",
  authMiddleware,
  requireRole("USER", "MERCHANT"),
  asyncHandler(pinController.forgotPin),
);

router.post(
  "/resend-forgot-pin-otp",
  authMiddleware,
  requireRole("USER", "MERCHANT"),
  asyncHandler(pinController.resendForgotPinOtp),
);

router.post(
  "/reset-pin",
  authMiddleware,
  requireRole("USER", "MERCHANT"),
  validate(resetPinWithOtpSchema),
  asyncHandler(pinController.resetPin),
);

export default router;
