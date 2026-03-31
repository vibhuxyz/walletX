import { api } from "./client";

export interface WithdrawToBankPayload {
  linkedAccountId: string;
  amount: string;
  pin: string;
  note?: string;
}

export interface WithdrawToBankResponse {
  transactionId: string;
  amount: string;
  newBalance: string;
  status: "SUCCESS";
  bankAccount: {
    bankName: string;
    maskedAccount: string;
    accountType: string;
  };
}

export async function withdrawToBank(
  payload: WithdrawToBankPayload,
): Promise<WithdrawToBankResponse> {
  const { data } = await api.post("/api/v0/wallet/withdraw", payload, {
    headers: {
      "idempotency-key": `withdraw-${Date.now()}-${Math.random()}`,
    },
  });

  return data.data as WithdrawToBankResponse;
}
