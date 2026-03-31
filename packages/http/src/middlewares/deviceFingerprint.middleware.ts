import { ApiError } from "@repo/libs";
import { Request, Response, NextFunction } from "express";

const normalizeIp = (ip: string) => {
  if (ip === "::1") return "127.0.0.1";
  return ip.replace(/^::ffff:/, "");
};

const getClientIp = (req: Request) => {
  const forwardedFor = req.headers["x-forwarded-for"];
  const xRealIp = req.headers["x-real-ip"];

  const forwardedIp = Array.isArray(forwardedFor)
    ? forwardedFor[0]
    : forwardedFor?.split(",")[0]?.trim();

  const realIp = Array.isArray(xRealIp) ? xRealIp[0] : xRealIp;

  const candidateIp =
    forwardedIp || realIp || req.ip || req.socket?.remoteAddress || "Unknown";

  return normalizeIp(candidateIp);
};

export const requireDeviceFingerprint = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const deviceId = req.headers["x-device-id"] as string;
  const deviceName = req.headers["x-device-name"] as string;

  if (!deviceId || !deviceName) {
    return next(
      new ApiError(400, "DEVICE_INFO_REQUIRED", "Device fingerprint required", {
        required: ["X-Device-ID", "X-Device-Name"],
      }),
    );
  }

  req.deviceInfo = {
    deviceId,
    deviceName: deviceName || "Unknown Device",
    ip: getClientIp(req),
    userAgent: req.headers["user-agent"] || "Unknown User Agent",
  };

  next();
};
