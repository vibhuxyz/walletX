import { Router } from "express";
import { asyncHandler, authMiddleware } from "@repo/http";
import { uploadSingle } from "@repo/http";
import * as uploadController from "../controller/upload.controller.js";

const router: Router = Router();

// Upload KYC ID Front
router.post(
  "/upload/id-front",
  authMiddleware,
  uploadSingle("file"),
  asyncHandler(uploadController.uploadIdFront),
);

// Upload KYC ID Back
router.post(
  "/upload/id-back",
  authMiddleware,
  uploadSingle("file"),
  asyncHandler(uploadController.uploadIdBack),
);

// Upload Selfie
router.post(
  "/upload/selfie",
  authMiddleware,
  uploadSingle("file"),
  asyncHandler(uploadController.uploadSelfie),
);

// Upload Profile Picture
router.post(
  "/upload/profile",
  authMiddleware,
  uploadSingle("file"),
  asyncHandler(uploadController.uploadProfile),
);

export default router;
