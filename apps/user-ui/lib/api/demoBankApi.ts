import { api } from "@/lib/api/client";

// ─── Types ────────────────────────────────────────────────────────────────────

export const DEMO_BANKS = [
  "State Bank of India",
  "HDFC Bank",
  "ICICI Bank",
  "Axis Bank",
  "Kotak Mahindra Bank",
  "Punjab National Bank",
  "Bank of Baroda",
  "Canara Bank",
  "Union Bank of India",
  "Indian Bank",
] as const;

export type DemoBank = (typeof DEMO_BANKS)[number];

export interface CreateBankAccountPayload {
  bankName: DemoBank;
  accountHolder: string;
  email: string;
  phone: string;
  accountType: "SAVINGS" | "CURRENT";
  initialBalance: string;
}

export interface BankAccount {
  accountId: string;
  accountNumber: string;
  bankName: string;
  accountHolder: string;
  email: string;
  phone: string;
  balance: string;
  accountType: "SAVINGS" | "CURRENT";
  ifscCode: string;
  branch: string;
  status: "ACTIVE" | "INACTIVE" | "PENDING";
  isFrozen: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface CreateBankAccountResponse {
  account: BankAccount;
  message: string;
}

export interface BankAccountsListResponse {
  accounts: BankAccount[];
  count: number;
}

export interface BankAccountDetailsResponse {
  account: BankAccount;
}

// ─── API Functions ────────────────────────────────────────────────────────────

export async function createBankAccount(
  payload: CreateBankAccountPayload,
): Promise<CreateBankAccountResponse> {
  const { data } = await api.post("/api/v0/bank/create-bank-accounts", payload);
  return {
    account: data.data as BankAccount,
    message: "Bank account created successfully",
  };
}

export async function getBankAccounts(): Promise<BankAccountsListResponse> {
  const { data } = await api.get("/api/v0/bank/bank-accounts");
  return data.data as BankAccountsListResponse;
}

export async function getBankAccountDetails(
  accountId: string,
): Promise<BankAccountDetailsResponse> {
  const { data } = await api.get(`/api/v0/bank/bank-accounts/${accountId}`);
  return { account: data.data as BankAccount };
}
