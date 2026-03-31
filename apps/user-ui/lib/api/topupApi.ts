// lib/wallet/topupApi.ts
import { api } from "./client";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface InitiateTopupPayload {
  linkedAccountId: string;
  amount: string;
}

export interface InitiateTopupResponse {
  orderId: string;
  amount: string;
  status: string;
  account: {
    bankName: string;
    maskedAccount: string;
    accountType: string;
  };
  message: string;
}

export interface VerifyPinPayload {
  orderId: string;
  pin: string;
}

export interface VerifyPinResponse {
  message: string;
  emailHint: string;
  expiresIn: number;
}

export interface ConfirmTopupPayload {
  orderId: string;
  otp: string;
}

export interface ConfirmTopupResponse {
  orderId: string;
  status: string;
  message: string;
  amount: string;
}

export interface TopupStatusResponse {
  orderId: string;
  amount: string;
  status: string;
  failureReason: string | null;
  account: {
    bankName: string;
    maskedAccount: string;
  };
  createdAt: string;
  updatedAt: string;
}

// ─── API Functions ────────────────────────────────────────────────────────────

export async function initiateTopup(
  payload: InitiateTopupPayload,
): Promise<InitiateTopupResponse> {
  const { data } = await api.post("/api/v0/wallet/topup/initiate", payload, {
    headers: { "idempotency-key": `topup-${Date.now()}-${Math.random()}` },
  });
  return data.data as InitiateTopupResponse;
}

export async function verifyTopupPin(
  payload: VerifyPinPayload,
): Promise<VerifyPinResponse> {
  const { data } = await api.post("/api/v0/wallet/topup/verify-pin", payload);
  return data.data as VerifyPinResponse;
}

export async function confirmTopup(
  payload: ConfirmTopupPayload,
): Promise<ConfirmTopupResponse> {
  const { data } = await api.post("/api/v0/wallet/topup/confirm", payload);
  return data.data as ConfirmTopupResponse;
}

export async function getTopupStatus(
  orderId: string,
): Promise<TopupStatusResponse> {
  const { data } = await api.get(`/api/v0/wallet/topup/${orderId}`);
  return data.data as TopupStatusResponse;
}
