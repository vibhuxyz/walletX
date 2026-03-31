import { Router } from "express";
import { asyncHandler } from "@repo/http";
import * as debitController from "../controllers/debit.controller.js";

const router: Router = Router();
router.post("/debit", asyncHandler(debitController.debitAccount));

export default router;
