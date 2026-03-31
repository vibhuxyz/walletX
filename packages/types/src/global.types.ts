import { Request } from "express";

export interface DeviceInfo {
  deviceId: string;
  deviceName: string;
  ip: string;
  userAgent?: string;
}

export interface JWTPayload {
  userId: string;
  email: string;
  role: string;
  deviceId: string;
  sessionId: string;
  iat: number;
  exp: number;
}

export interface RefreshTokenData {
  userId: string;
  email: string;
  role: string;
  deviceId: string;
  deviceName: string;
  sessionId: string;
  createdAt: string;
  lastUsedAt: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: JWTPayload;
      deviceInfo?: DeviceInfo;
      requestId?: string;
    }
  }
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  meta: {
    requestId: string;
    timestamp: string;
    version?: string;
  };
}
