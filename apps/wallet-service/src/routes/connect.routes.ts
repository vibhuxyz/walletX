import {
  asyncHandler,
  authMiddleware,
  requireRole,
  validate,
} from "@repo/http";
import {
  createConnectPartnerSchema,
  createOnboardingSessionSchema,
  createWalletHoldSchema,
  exchangeConnectTokenSchema,
  partnerWalletCreditSchema,
} from "@repo/zod-schema";
import { Router } from "express";
import * as connectController from "../controllers/connect.controller.js";
import {
  partnerAuthMiddleware,
  requirePartnerScope,
} from "../middlewares/partnerAuth.middleware.js";

const router: Router = Router();

router.get("/partners", asyncHandler(connectController.listPartners));

router.post(
  "/partners",
  validate(createConnectPartnerSchema),
  asyncHandler(connectController.createPartner),
);

router.post(
  "/onboarding-sessions",
  partnerAuthMiddleware,
  requirePartnerScope("wallet:read"),
  validate(createOnboardingSessionSchema),
  asyncHandler(connectController.createOnboardingSession),
);

router.get(
  "/onboarding-sessions/:sessionId",
  asyncHandler(connectController.getOnboardingSession),
);

router.post(
  "/onboarding-sessions/:sessionId/complete",
  authMiddleware,
  requireRole("USER"),
  asyncHandler(connectController.completeOnboardingSession),
);

router.post(
  "/token",
  partnerAuthMiddleware,
  validate(exchangeConnectTokenSchema),
  asyncHandler(connectController.exchangeToken),
);

router.get(
  "/wallets/:walletId/balance",
  partnerAuthMiddleware,
  requirePartnerScope("wallet:read"),
  asyncHandler(connectController.getPartnerWalletBalance),
);

router.post(
  "/wallets/:walletId/holds",
  partnerAuthMiddleware,
  requirePartnerScope("wallet:hold"),
  validate(createWalletHoldSchema),
  asyncHandler(connectController.createHold),
);

router.post(
  "/holds/:holdId/capture",
  partnerAuthMiddleware,
  requirePartnerScope("wallet:capture"),
  asyncHandler(connectController.captureHold),
);

router.post(
  "/holds/:holdId/release",
  partnerAuthMiddleware,
  requirePartnerScope("wallet:hold"),
  asyncHandler(connectController.releaseHold),
);

router.post(
  "/wallets/:walletId/credits",
  partnerAuthMiddleware,
  requirePartnerScope("wallet:credit"),
  validate(partnerWalletCreditSchema),
  asyncHandler(connectController.creditWallet),
);

export default router;
