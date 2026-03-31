import { asyncHandler, validate } from "@repo/http";
import { Router } from "express";
import * as passwordController from "../controller/password.controller.js";
import {
  forgotPasswordSchema,
  resetPasswordSchema,
  resendOtpSchema,
} from "@repo/zod-schema";

const router: Router = Router();

// router.post(
//   "/change-password",
//   authMiddleware,
//   // validate(changePasswordSchema),
//   // asyncHandler(passwordController.changePassword)
// );

router.post(
  "/forgot-password",
  validate(forgotPasswordSchema),
  asyncHandler(passwordController.forgotPassword),
);

router.post(
  "/resend-forgot-password-otp",
  validate(resendOtpSchema),
  asyncHandler(passwordController.resendForgotPasswordOtp),
);

router.post(
  "/reset-password",
  validate(resetPasswordSchema),
  asyncHandler(passwordController.resetPassword),
);

export default router;
