import { prismaPostgres } from "@repo/db-postgres";
import { Request, Response } from "express";

export const getDevices = async (req: Request, res: Response) => {};

export const trustDevice = async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const { deviceId } = req.params;

  await prismaPostgres.trustedDevice.update({
    //@ts-ignore
    where: { id: deviceId },
    data: { isTrusted: true },
  });

  res.json({
    success: true,
    data: {
      message: "Device trusted successfully",
    },
    meta: {
      requestId: req.requestId!,
      timestamp: new Date().toISOString(),
    },
  });
};
