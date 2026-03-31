// packages/http/src/api.types.ts
import { Request } from "express";

export interface DeviceInfo {
  deviceId: string;
  deviceName: string;
  ip: string;
  fingerprint?: string;
  userAgent?: string;
  ipAddress?: string;
}

// Extend the Request interface
export interface ExtendedRequest extends Request {
  deviceInfo?: DeviceInfo;
  requestId?: string;
}

// Module augmentation
declare module "express" {
  interface Request {
    deviceInfo?: DeviceInfo;
    requestId?: string;
  }
}

export {};
