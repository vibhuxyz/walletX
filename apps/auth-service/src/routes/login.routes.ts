import { Router } from "express";
import {
  asyncHandler,
  validate,
  requireDeviceFingerprint,
  authMiddleware,
} from "@repo/http";
import {
  loginSchema,
  resendLoginOtpSchema,
  verifyLoginOtpSchema,
} from "@repo/zod-schema";
import * as loginController from "../controller/login.controller.js";

const router: Router = Router();

router.post(
  "/login-user",
  requireDeviceFingerprint,
  validate(loginSchema),
  asyncHandler(loginController.userLogin),
);

router.post(
  "/user-verify-otp",
  requireDeviceFingerprint,
  validate(verifyLoginOtpSchema),
  asyncHandler(loginController.verifyCustomerLoginOtp),
);

router.post(
  "/resend-login-otp",
  requireDeviceFingerprint,
  validate(resendLoginOtpSchema),
  asyncHandler(loginController.resendCustomerLoginOtp),
);

router.post(
  "/refresh/:role",
  requireDeviceFingerprint,
  asyncHandler(loginController.refreshToken),
);

router.post(
  "/logout/:role",
  authMiddleware,
  asyncHandler(loginController.logOut),
);

router.get(
  "/me/:role",
  authMiddleware,
  asyncHandler(loginController.getCurrentUser),
);

router.get(
  "/loged-in/:role",
  authMiddleware,
  asyncHandler(loginController.getCurrentUser),
);

export default router;
