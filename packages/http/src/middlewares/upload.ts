import multer from "multer";
import { ApiError } from "@repo/libs";
import type { RequestHandler } from "express";

// Store in memory for processing
const storage = multer.memoryStorage();

// File filter
const fileFilter = (
  req: any,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback,
) => {
  const allowedMimes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new ApiError(
        400,
        "INVALID_FILE_TYPE",
        "Only JPEG, PNG, and WebP images are allowed",
      ) as any,
    );
  }
};

// Create multer instance
export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
    files: 1,
  },
});

// Single file upload middleware
export const uploadSingle = (fieldName: string): RequestHandler => {
  return upload.single(fieldName);
};
