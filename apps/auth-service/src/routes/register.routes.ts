import { asyncHandler, requireDeviceFingerprint, validate } from "@repo/http";
import { registerSchema, verifyEmailSchema } from "@repo/zod-schema";
import { Router } from "express";
import * as registerController from "../controller/register.controller.js";

const router: Router = Router();

router.post(
  "/register-user",
  requireDeviceFingerprint,
  validate(registerSchema),
  asyncHandler(registerController.registerUser),
);

router.post(
  "/verify-email",
  requireDeviceFingerprint,
  validate(verifyEmailSchema),
  asyncHandler(registerController.verifyEmail),
);

router.post("/resend-otp", asyncHandler(registerController.resendOTP));

// router.post(
//   "/register/merchant",
//   requireDeviceFingerprint,
//   validate(registerSchema),
//   asyncHandler(registerController.register),
// );

router.post(
  "/register/bank-admin",
  requireDeviceFingerprint,
  validate(registerSchema),
  asyncHandler(registerController.registerBankAdmin),
);



export default router;
