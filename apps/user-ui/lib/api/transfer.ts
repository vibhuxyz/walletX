// lib/wallet/transfer.ts
import axios from "axios";
import { getDeviceHeaders } from "@/lib/api/auth";

// ✅ Re-export canonical hook — no duplicate logic
export { useRecentRecipients } from "@/lib/wallet/useWalletQuery";

const BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";

export const PIN_THRESHOLD = 500;

// ── Types ─────────────────────────────────────────────────────────────────────

export interface ValidateResponse {
  transferId: string;
  requiresPin: boolean;
  recipient: { name: string; email: string; qrCode: string };
  transaction: {
    amount: string;
    fee: string;
    total: string;
    newBalance: string;
  };
  expiresIn: number;
}

export interface ConfirmResponse {
  transactionId: string;
  status: string;
  amount: string;
  recipient: { name: string; email: string };
  newBalance: string;
  timestamp: string;
}

export interface Recipient {
  name: string;
  email: string;
  avatar?: string;
}

// ── API helpers ───────────────────────────────────────────────────────────────

export async function apiValidateTransfer(
  recipient: string,
  amount: string,
  note?: string,
): Promise<ValidateResponse> {
  const { data } = await axios.post(
    `${BASE}/api/v0/wallet/transfer-validate`,
    { recipient, amount, note },
    { withCredentials: true, headers: { ...getDeviceHeaders() } },
  );
  return data.data as ValidateResponse;
}

export async function apiConfirmTransfer(
  transferId: string,
  pin?: string,
): Promise<ConfirmResponse> {
  const body: Record<string, string> = { transferId };
  if (pin) body.pin = pin;

  const { data } = await axios.post(
    `${BASE}/api/v0/wallet/transfer/confirm`,
    body,
    {
      withCredentials: true,
      headers: {
        ...getDeviceHeaders(),
        "idempotency-key": `${transferId}-${Date.now()}`,
      },
    },
  );
  return data.data as ConfirmResponse;
}

export function getApiError(err: unknown): string {
  if (axios.isAxiosError(err)) {
    const data = err.response?.data as
      | string
      | {
          message?: string;
          code?: string;
          error?: string | { code?: string; message?: string };
          details?: unknown;
        }
      | undefined;

    if (typeof data === "string") {
      return data;
    }

    if (data && typeof data === "object") {
      if (typeof data.error === "object" && data.error !== null) {
        return (
          data.error.message ??
          data.error.code ??
          data.message ??
          data.code ??
          "Request failed"
        );
      }

      if (typeof data.error === "string") {
        return data.message ?? data.error ?? data.code ?? "Request failed";
      }

      return data.message ?? data.code ?? "Request failed";
    }

    return err.message || "Request failed";
  }

  return err instanceof Error ? err.message : "Something went wrong";
}
