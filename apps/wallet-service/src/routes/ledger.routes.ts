import { Router } from "express";
import { asyncHandler, authMiddleware } from "@repo/http";
import * as ledgerController from "../controllers/ledger.controller.js";

const router: Router = Router();


// get all ledger entries with filtering
router.get(
  "/ledger",
  authMiddleware,
  asyncHandler(ledgerController.getLedgerEntries),
);

// Get single ledger entry details
router.get(
  "/ledger/:entryId",
  authMiddleware,
  asyncHandler(ledgerController.getLedgerEntryDetails),
);

// Get ledger statistics
router.get(
  "/ledger/stats/summary",
  authMiddleware,
  asyncHandler(ledgerController.getLedgerStatistics),
);

router.get(
  "/ledger/stats/analytics",
  authMiddleware,
  asyncHandler(ledgerController.getLedgerAnalytics),
);

export default router;
