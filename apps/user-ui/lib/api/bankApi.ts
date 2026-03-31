// lib/bank/bankApi.ts
import { api } from "./client";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface BanksResponse {
  banks: string[];
}

export interface LinkInitiatePayload {
  bankName: string;
  accountNumber: string;
  ifscCode: string;
  accountHolder: string;
  accountType: "SAVINGS" | "CURRENT" | "CHECKING";
}

export interface LinkInitiateResponse {
  linkToken: string;
  maskedAccount: string;
  bankName: string;
  accountType: string;
  accountHolder: string;
  message: string;
  expiresIn: number;
}

export interface LinkVerifyPinResponse {
  message: string;
  linkToken: string;
  emailHint: string;
  expiresIn: number;
}

export interface LinkedAccount {
  linkId: string;
  bankName: string;
  maskedAccount: string;
  accountType: string;
  isDefault: boolean;
}

export interface LinkConfirmResponse {
  message: string;
  account: LinkedAccount;
}

export interface BankAccount {
  linkId: string;
  accountId: string;
  bankName: string;
  accountNumber: string;
  accountType: string;
  balance: string;
  status: "ACTIVE" | "INACTIVE" | "PENDING" | string;
  isDefault: boolean;
}

export interface LinkedAccountsResponse {
  accounts: BankAccount[];
}

// ─── API Functions ────────────────────────────────────────────────────────────

export async function fetchBanks(): Promise<BanksResponse> {
  const { data } = await api.get("/api/v0/bank/banks");
  return data.data as BanksResponse;
}

export async function fetchLinkedAccounts(): Promise<LinkedAccountsResponse> {
  const { data } = await api.get("/api/v0/bank/accounts");
  return data.data as LinkedAccountsResponse;
}

export async function initiateBankLink(
  payload: LinkInitiatePayload,
): Promise<LinkInitiateResponse> {
  const { data } = await api.post("/api/v0/bank/link-initiate", payload);
  return data.data as LinkInitiateResponse;
}

export async function verifyBankLinkPin(
  linkToken: string,
  pin: string,
): Promise<LinkVerifyPinResponse> {
  const { data } = await api.post("/api/v0/bank/link-verify-pin", {
    linkToken,
    pin,
  });
  return data.data as LinkVerifyPinResponse;
}

export async function confirmBankLink(
  linkToken: string,
  otp: string,
): Promise<LinkConfirmResponse> {
  const { data } = await api.post("/api/v0/bank/link-confirm", {
    linkToken,
    otp,
  });
  return data.data as LinkConfirmResponse;
}
