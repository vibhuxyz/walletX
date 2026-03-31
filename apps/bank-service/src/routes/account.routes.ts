import {
  asyncHandler,
  authMiddleware,
  requireRole,
  validate,
} from "@repo/http";
import { Router } from "express";
import * as accountController from "../controllers/account.controller.js";
import {
  confirmBankLinkSchema,
  createBankAccountSchema,
  initiateBankLinkSchema,
  verifyPinBankLinkSchema,
} from "@repo/zod-schema";

const router: Router = Router();

router.get("/banks", asyncHandler(accountController.getAvailableBanks));

// Get user's linked accounts
router.get(
  "/accounts",
  authMiddleware,
  requireRole("USER"),
  asyncHandler(accountController.getLinkedAccounts),
);

router.post(
  "/link-initiate",
  authMiddleware,
  requireRole("USER"),
  validate(initiateBankLinkSchema),
  asyncHandler(accountController.initiateBankLink),
);

router.post(
  "/link-verify-pin",
  authMiddleware,
  requireRole("USER"),
  validate(verifyPinBankLinkSchema),
  asyncHandler(accountController.verifyPinAndSendOTP),
);

router.post(
  "/link-confirm",
  authMiddleware,
  requireRole("USER"),
  validate(confirmBankLinkSchema),
  asyncHandler(accountController.confirmBankLink),
);

router.post(
  "/create-bank-accounts",
  authMiddleware,
  requireRole("USER"),
  validate(createBankAccountSchema),
  asyncHandler(accountController.createBankAccount),
);

router.get(
  "/bank-accounts",
  authMiddleware,
  requireRole("USER"),
  asyncHandler(accountController.getUserBankAccounts),
);

router.get(
  "/bank-accounts/:accountId",
  authMiddleware,
  requireRole("USER"),
  asyncHandler(accountController.getBankAccountDetails),
);


export default router;
