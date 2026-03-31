import { ENV } from "@repo/config";
import { ApiError, Logger } from "@repo/libs";
import sharp from "sharp";
import { Readable } from "stream";
import { v2 as cloudinary } from "cloudinary";
import type { UploadApiResponse } from "cloudinary";

const logger = new Logger("CloudinaryService");

// Configure Cloudinary
cloudinary.config({
  cloud_name: ENV.CLOUDINARY_CLOUD_NAME,
  api_key: ENV.CLOUDINARY_API_KEY,
  api_secret: ENV.CLOUDINARY_API_SECRET,
  secure: true,
});

// Upload types
type UploadType = "idFront" | "idBack" | "selfie" | "profile";

// Type-specific configurations
type UploadConfig = {
  folder: string;
  maxWidth: number;
  maxHeight: number;
  quality: number;
  transformation?: any;
};

const UPLOAD_CONFIG: Record<UploadType, UploadConfig> = {
  idFront: {
    folder: `${ENV.CLOUDINARY_FOLDER}/kyc/id-front`,
    maxWidth: 2000,
    maxHeight: 2000,
    quality: 85,
  },
  idBack: {
    folder: `${ENV.CLOUDINARY_FOLDER}/kyc/id-back`,
    maxWidth: 2000,
    maxHeight: 2000,
    quality: 85,
  },
  selfie: {
    folder: `${ENV.CLOUDINARY_FOLDER}/kyc/selfie`,
    maxWidth: 1000,
    maxHeight: 1000,
    quality: 80,
  },
  profile: {
    folder: `${ENV.CLOUDINARY_FOLDER}/profiles`,
    maxWidth: 500,
    maxHeight: 500,
    quality: 80,
    transformation: {
      width: 500,
      height: 500,
      crop: "fill",
      gravity: "face",
    },
  },
};
// Allowed MIME types
const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
];

// Max file size: 5MB
const MAX_FILE_SIZE = 5 * 1024 * 1024;

/**
 * Validate uploaded file
 */
export function validateFile(file: Express.Multer.File): void {
  if (!file) {
    throw new ApiError(400, "FILE_REQUIRED", "No file uploaded");
  }

  if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    throw new ApiError(
      400,
      "INVALID_FILE_TYPE",
      "Only JPEG, PNG, and WebP images are allowed",
    );
  }

  if (file.size > MAX_FILE_SIZE) {
    throw new ApiError(
      400,
      "FILE_TOO_LARGE",
      `File size must be less than ${MAX_FILE_SIZE / (1024 * 1024)}MB`,
    );
  }
}

/**
 * Process image with Sharp
 */
async function processImage(
  buffer: Buffer,
  config: { maxWidth: number; maxHeight: number; quality: number },
): Promise<Buffer> {
  return sharp(buffer)
    .resize(config.maxWidth, config.maxHeight, {
      fit: "inside",
      withoutEnlargement: true,
    })
    .jpeg({ quality: config.quality })
    .toBuffer();
}

/**
 * Upload buffer to Cloudinary
 */
function uploadToCloudinary(
  buffer: Buffer,
  options: {
    folder: string;
    publicId: string;
    transformation?: any;
  },
): Promise<UploadApiResponse> {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: options.folder,
        public_id: options.publicId,
        resource_type: "image",
        format: "jpg",
        transformation: options.transformation,
        overwrite: false,
      },
      (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result!);
        }
      },
    );

    const readable = Readable.from(buffer);
    readable.pipe(uploadStream);
  });
}

/**
 * Main upload function
 */
export async function uploadImage(
  file: Express.Multer.File,
  uploadType: UploadType,
  userId: string,
): Promise<{ url: string; publicId: string }> {
  try {
    // Validate file
    validateFile(file);

    const config = UPLOAD_CONFIG[uploadType];
    const publicId = `${userId}_${uploadType}_${Date.now()}`;

    logger.info("Processing image", {
      userId,
      uploadType,
      originalSize: file.size,
    });

    // Process image with Sharp
    const processedBuffer = await processImage(file.buffer, config);

    logger.info("Uploading to Cloudinary", {
      userId,
      uploadType,
      processedSize: processedBuffer.length,
    });

    // Upload to Cloudinary
    const result = await uploadToCloudinary(processedBuffer, {
      folder: config.folder,
      publicId,
      transformation: config.transformation,
    });

    logger.info("Image uploaded successfully", {
      userId,
      uploadType,
      url: result.secure_url,
      publicId: result.public_id,
    });

    return {
      url: result.secure_url,
      publicId: result.public_id,
    };
  } catch (error) {
    logger.error("Failed to upload image", {
      error,
      userId,
      uploadType,
    });

    if (error instanceof ApiError) {
      throw error;
    }

    throw new ApiError(
      500,
      "UPLOAD_FAILED",
      "Failed to upload image. Please try again.",
    );
  }
}

/**
 * Delete image from Cloudinary
 */
export async function deleteImage(publicId: string): Promise<void> {
  try {
    await cloudinary.uploader.destroy(publicId);
    logger.info("Image deleted from Cloudinary", { publicId });
  } catch (error) {
    logger.warn("Failed to delete image from Cloudinary", { publicId, error });
  }
}

/**
 * Get image details
 */
export async function getImageDetails(publicId: string) {
  try {
    return await cloudinary.api.resource(publicId);
  } catch (error) {
    logger.warn("Failed to get image details", { publicId, error });
    return null;
  }
}
