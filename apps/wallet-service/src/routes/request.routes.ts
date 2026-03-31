import {
  asyncHandler,
  authMiddleware,
  requireRole,
  validate,
} from "@repo/http";
import { Router } from "express";

import * as requestController from "../controllers/request.controller.js";
import { createPaymentRequestSchema, payRequestSchema } from "@repo/zod-schema";

const router: Router = Router();

router.post(
  "/requests",
  authMiddleware,
  requireRole("USER"),
  validate(createPaymentRequestSchema),
  asyncHandler(requestController.createPaymentRequest),
);

// Get sent requests 
router.get(
  "/requests/sent",
  authMiddleware,
  requireRole("USER"),
  asyncHandler(requestController.getSentRequests),
);

// Get received requests 
router.get(
  "/requests/received",
  authMiddleware,
  requireRole("USER"),
  asyncHandler(requestController.getReceivedRequests),
);

// Get single request details
router.get(
  "/requests/:requestId",
  authMiddleware,
  requireRole("USER"),
  asyncHandler(requestController.getRequestDetails),
);

// Pay a request (requires PIN)
router.post(
  "/requests/:requestId/pay",
  authMiddleware,
  requireRole("USER"),
  validate(payRequestSchema),
  asyncHandler(requestController.payRequest),
);

// Decline a request
router.post(
  "/requests/:requestId/decline",
  authMiddleware,
  requireRole("USER"),
  asyncHandler(requestController.declineRequest),
);

// Cancel own request
router.delete(
  "/requests/:requestId/cancel",
  authMiddleware,
  requireRole("USER"),
  asyncHandler(requestController.cancelRequest),
);

export default router;
