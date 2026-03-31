import jwt from "jsonwebtoken";
import { ENV } from "@repo/config";
import { Request, Response } from "express";

/**
 * Generate a short-lived WebSocket token
 */
export const getWebSocketToken = async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const email = req.user!.email;
  const role = req.user!.role;
  const sessionId = req.user!.sessionId;

  // Create a short-lived token (15 minutes) for WebSocket
  const wsToken = jwt.sign(
    { userId, email, role, sessionId, tokenType: "ws" },
    ENV.JWT_SECRET,
    {
      expiresIn: "15m",
      issuer: "wallet-app",
      audience: "wallet-realtime",
    },
  );

  res.json({
    success: true,
    data: {
      token: wsToken,
      expiresIn: 900, // 15 minutes
    },
  });
};
