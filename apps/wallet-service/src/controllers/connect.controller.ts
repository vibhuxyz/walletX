import { ENV } from "@repo/config";
import { ApiError, Logger } from "@repo/libs";
import { Request, Response } from "express";
import * as connectService from "../services/connect.service.js";

const logger = new Logger("connect.controller");

function send(res: Response, data: any, status = 200) {
  res.status(status).json({
    success: true,
    data,
    meta: {
      requestId: res.req.requestId!,
      timestamp: new Date().toISOString(),
    },
  });
}

function requiredParam(req: Request, name: string) {
  const value = req.params[name];
  if (!value) {
    throw new ApiError(400, "MISSING_ROUTE_PARAM", `${name} is required`);
  }
  return Array.isArray(value) ? value[0]! : value;
}

function requireServiceKey(req: Request) {
  const serviceKey = req.header("X-WalletX-Service-Key");

  if (!serviceKey || serviceKey !== ENV.WALLET_SERVICE_API_KEY) {
    throw new ApiError(
      401,
      "SERVICE_AUTH_REQUIRED",
      "Valid X-WalletX-Service-Key header required",
    );
  }
}

export async function listPartners(req: Request, res: Response) {
  requireServiceKey(req);

  const result = await connectService.listPartners();
  send(res, result);
}

export async function createPartner(req: Request, res: Response) {
  requireServiceKey(req);

  const result = await connectService.createPartner(req.body);
  send(res, result, 201);
}

export async function createOnboardingSession(req: Request, res: Response) {
  logger.info("Create connect onboarding session", {
    partnerId: req.partner!.id,
    partnerUserId: req.body.partnerUserId,
  });

  const result = await connectService.createOnboardingSession(
    {
      id: req.partner!.id,
      redirectUris: req.partner!.redirectUris,
    },
    req.body,
  );

  send(res, result, 201);
}

export async function getOnboardingSession(req: Request, res: Response) {
  const result = await connectService.getOnboardingSession(
    requiredParam(req, "sessionId"),
  );
  send(res, result);
}

export async function completeOnboardingSession(req: Request, res: Response) {
  const result = await connectService.completeOnboardingSession(
    requiredParam(req, "sessionId"),
    req.user!.userId,
  );
  send(res, result);
}

export async function exchangeToken(req: Request, res: Response) {
  const result = await connectService.exchangeToken(
    req.partner!.id,
    req.body.code,
  );
  send(res, result);
}

export async function getPartnerWalletBalance(req: Request, res: Response) {
  const result = await connectService.getPartnerWalletBalance(
    req.partner!.id,
    requiredParam(req, "walletId"),
  );
  send(res, result);
}

export async function createHold(req: Request, res: Response) {
  const idempotencyKey = req.header("Idempotency-Key");
  if (!idempotencyKey) {
    throw new ApiError(
      400,
      "IDEMPOTENCY_KEY_REQUIRED",
      "Idempotency-Key header required",
    );
  }

  const result = await connectService.createHold(
    req.partner!.id,
    requiredParam(req, "walletId"),
    {
      ...req.body,
      idempotencyKey,
    },
  );
  send(res, result, 201);
}

export async function captureHold(req: Request, res: Response) {
  const result = await connectService.captureHold(
    req.partner!.id,
    requiredParam(req, "holdId"),
  );
  send(res, result);
}

export async function releaseHold(req: Request, res: Response) {
  const result = await connectService.releaseHold(
    req.partner!.id,
    requiredParam(req, "holdId"),
  );
  send(res, result);
}

export async function creditWallet(req: Request, res: Response) {
  const idempotencyKey = req.header("Idempotency-Key");
  if (!idempotencyKey) {
    throw new ApiError(
      400,
      "IDEMPOTENCY_KEY_REQUIRED",
      "Idempotency-Key header required",
    );
  }

  const result = await connectService.creditWallet(
    req.partner!.id,
    requiredParam(req, "walletId"),
    {
      ...req.body,
      idempotencyKey,
    },
  );
  send(res, result, 201);
}
