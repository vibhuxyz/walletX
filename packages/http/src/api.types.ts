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
  partner?: {
    id: string;
    name: string;
    scopes: string[];
    redirectUris: string[];
  };
}

// Module augmentation
declare module "express" {
  interface Request {
    deviceInfo?: DeviceInfo;
    requestId?: string;
    partner?: {
      id: string;
      name: string;
      scopes: string[];
      redirectUris: string[];
    };
  }
}

export {};
