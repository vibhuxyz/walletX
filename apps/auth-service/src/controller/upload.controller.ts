import { Logger } from "@repo/libs";
import * as cloudinaryService from "../services/cloudinary.service.js";
import type { Request, Response } from "express";

const logger = new Logger("UploadController");

// Upload ID Front
export const uploadIdFront = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const userId = req.user!.userId;
  const file = req.file;

  if (!file) {
    res.status(400).json({
      success: false,
      error: "No file uploaded",
      code: "FILE_REQUIRED",
    });
    return;
  }

  logger.info("Uploading ID front", { userId });

  const result = await cloudinaryService.uploadImage(file, "idFront", userId);

  res.json({
    success: true,
    data: {
      url: result.url,
      publicId: result.publicId,
      type: "idFront",
    },
    meta: {
      requestId: req.requestId!,
      timestamp: new Date().toISOString(),
    },
  });
};

// Upload ID Back
export const uploadIdBack = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const userId = req.user!.userId;
  const file = req.file;

  if (!file) {
    res.status(400).json({
      success: false,
      error: "No file uploaded",
      code: "FILE_REQUIRED",
    });
    return;
  }

  logger.info("Uploading ID back", { userId });

  const result = await cloudinaryService.uploadImage(file, "idBack", userId);

  res.json({
    success: true,
    data: {
      url: result.url,
      publicId: result.publicId,
      type: "idBack",
    },
    meta: {
      requestId: req.requestId!,
      timestamp: new Date().toISOString(),
    },
  });
};

// Upload Selfie
export const uploadSelfie = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const userId = req.user!.userId;
  const file = req.file;

  if (!file) {
    res.status(400).json({
      success: false,
      error: "No file uploaded",
      code: "FILE_REQUIRED",
    });
    return;
  }

  logger.info("Uploading selfie", { userId });

  const result = await cloudinaryService.uploadImage(file, "selfie", userId);

  res.json({
    success: true,
    data: {
      url: result.url,
      publicId: result.publicId,
      type: "selfie",
    },
    meta: {
      requestId: req.requestId!,
      timestamp: new Date().toISOString(),
    },
  });
};

// Upload Profile Picture
export const uploadProfile = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const userId = req.user!.userId;
  const file = req.file;

  if (!file) {
    res.status(400).json({
      success: false,
      error: "No file uploaded",
      code: "FILE_REQUIRED",
    });
    return;
  }

  logger.info("Uploading profile picture", { userId });

  const result = await cloudinaryService.uploadImage(file, "profile", userId);

  res.json({
    success: true,
    data: {
      url: result.url,
      publicId: result.publicId,
      type: "profile",
    },
    meta: {
      requestId: req.requestId!,
      timestamp: new Date().toISOString(),
    },
  });
};
