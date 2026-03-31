import { Logger } from "@repo/libs";
import { Request, Response } from "express";
import * as requestService from "../services/request.service.js";

const logger = new Logger("request.controller");

export const createPaymentRequest = async (req: Request, res: Response) => {
  const userId = req.user?.userId!;
  const { recipientIdentifier, amount, reason } = req.body;

  logger.info("Create payment request", {
    userId,
    recipientIdentifier,
    amount,
  });

  const result = await requestService.createPaymentRequest(
    userId,
    recipientIdentifier,
    amount,
    reason,
  );

  res.json({
    success: true,
    data: result,
    meta: {
      requestId: req.requestId!,
      timestamp: new Date().toISOString(),
    },
  });
};

export const getSentRequests = async (req: Request, res: Response) => {
  const userId = req.user?.userId!;
  const { status, limit, cursor } = req.query;

  logger.info("Get sent requests", { userId, status });

  const result = await requestService.getSentRequests(userId, {
    status: status as string,
    limit: limit ? parseInt(limit as string) : undefined,

    cursor: cursor as string,
  });

  res.json({
    success: true,
    data: result,
    meta: {
      requestId: req.requestId!,
      timestamp: new Date().toISOString(),
    },
  });
};

export const getReceivedRequests = async (req: Request, res: Response) => {
  const userId = req.user!.userId;

  const { status, limit, cursor } = req.query;

  logger.info("Get received requests", { userId, status });

  const result = await requestService.getReceivedRequests(userId, {
    status: status as string,
    limit: limit ? parseInt(limit as string) : undefined,
    cursor: cursor as string,
  });
  res.json({
    success: true,
    data: result,
    meta: {
      requestId: req.requestId!,
      timestamp: new Date().toISOString(),
    },
  });
};

export const getRequestDetails = async (req: Request, res: Response) => {
  const userId = req.user!.userId;

  const { requestId } = req.params;

  if (typeof requestId !== "string") {
    return res.status(400).json({
      success: false,
      message: "Invalid or missing requestId",
    });
  }

  logger.info("Get request details", { userId, requestId });

  const result = await requestService.getRequestDetails(userId, requestId);
  res.json({
    success: true,
    data: result,
    meta: {
      requestId: req.requestId!,
      timestamp: new Date().toISOString(),
    },
  });
};

export const payRequest = async (req: Request, res: Response) => {
  const userId = req.user!.userId;

  const { requestId } = req.params;

  const { pin } = req.body;

  if (typeof requestId !== "string") {
    return res.status(400).json({
      success: false,
      message: "Invalid or missing requestId",
    });
  }

  logger.info("Pay request", { userId, requestId });

  const result = await requestService.payRequest(userId, requestId, pin);

  res.json({
    success: true,
    data: result,
    meta: {
      requestId: req.requestId!,
      timestamp: new Date().toISOString(),
    },
  });
};
export const declineRequest = async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const { requestId } = req.params;

  if (typeof requestId !== "string") {
    return res.status(400).json({
      success: false,
      message: "Invalid or missing requestId",
    });
  }

  logger.info("Decline request", { userId, requestId });

  const result = await requestService.declineRequest(userId, requestId);

  res.json({
    success: true,
    data: result,
    meta: {
      requestId: req.requestId!,
      timestamp: new Date().toISOString(),
    },
  });
};
export const cancelRequest = async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const { requestId } = req.params;

  if (typeof requestId !== "string") {
    return res.status(400).json({
      success: false,
      message: "Invalid or missing requestId",
    });
  }

  logger.info("Cancel request", { userId, requestId });

  const result = await requestService.cancelRequest(userId, requestId);

  res.json({
    success: true,
    data: result,
    meta: {
      requestId: req.requestId!,
      timestamp: new Date().toISOString(),
    },
  });
};
