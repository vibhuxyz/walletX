import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { api } from "@/lib/api/client";
import {
  getLedgerEntries,
  getLedgerStatistics,
  type LedgerEntry,
  type LedgerStatistics,
} from "../api/ledgerApi";

export interface TransactionDisplay {
  title: string;
  subtitle: string;
  image: string | null;
  meta: {
    counterpartyName: string | null;
    counterpartyEmail: string | null;
    transactionId: string;
  };
}

export interface WalletInfo {
  id: string;
  balance: string;
  status: "ACTIVE" | "PENDING_KYC" | "FROZEN" | string;
  isFrozen: boolean;
  qrCode: string;
}

export interface KycProfile {
  selfieUrl: string | null;
}

export interface UserData {
  userId: string;
  email: string;
  phone: string;
  fullName: string;
  role: string;
  isEmailVerified: boolean;
  isActive: boolean;
  lastLoginAt: string | null;
  createdAt: string;
  wallet: WalletInfo;
  kycProfile?: KycProfile;
}

export interface BalanceData {
  totalBalance: string;
  availableBalance: string;
  currency: string;
  status: string;
  isFrozen: boolean;
  lastUpdated: string;
}

export interface Recipient {
  id: string;
  name: string;
  email: string;
  avatar: string | null;
  lastSentAt: string;
}

export interface Transaction {
  id: string;
  type: string;
  amount: string;
  balanceAfter: string;
  status: "SUCCESS" | "PENDING" | "FAILED";
  createdAt: string;
  display: TransactionDisplay;
  description?: string;
  note?: string;
}

export interface DashboardSummaryData {
  availableBalance: string;
  totalBalance: string;
  currency: string;
  status: string;
  isFrozen: boolean;
  lastUpdated: string;
  totalIncome: string;
  totalExpenses: string;
  totalTransactions: number;
  stats: LedgerStatistics;
}

export const qk = {
  user: ["auth", "me"] as const,
  balance: ["wallet", "balance"] as const,
  recipients: ["wallet", "recipients"] as const,

  walletTransactionsRoot: ["wallet", "transactions"] as const,
  walletTransactions: (limit: number) =>
    ["wallet", "transactions", limit] as const,
  allTransactions: ["wallet", "transactions", "all"] as const,

  dashboardSummary: ["dashboard", "summary"] as const,

  recentTransactionsRoot: ["recent-transactions"] as const,
  recentTransactions: (limit: number) =>
    ["recent-transactions", limit] as const,

  ledgerRoot: ["ledger"] as const,
  ledgerList: (
    page: number,
    categoryFilter: string,
    statusFilter: string,
    search: string,
  ) => ["ledger", "list", page, categoryFilter, statusFilter, search] as const,
  ledgerStats: ["ledger", "stats", "summary"] as const,
  ledgerAnalyticsRoot: ["ledger", "analytics"] as const,
  ledgerAnalytics: (months: number) => ["ledger", "analytics", months] as const,
  ledgerTopups: (limit: number) => ["ledger", "topup", limit] as const,
  ledgerWithdrawals: (limit: number) =>
    ["ledger", "withdrawals", limit] as const,

  bankRoot: ["bank"] as const,
  bankAccounts: ["bank", "accounts"] as const,
  bankList: ["bank", "list"] as const,

  paymentRequestsRoot: ["payment-requests"] as const,
  paymentRequestsSent: ["payment-requests", "sent"] as const,
  paymentRequestsReceived: ["payment-requests", "received"] as const,
};

export async function fetchCurrentUser(): Promise<UserData | null> {
  try {
    const { data } = await api.get("/api/v0/auth/loged-in/user");
    return data.data as UserData;
  } catch (err: any) {
    if (err.response?.status === 401) {
      return null;
    }
    throw err;
  }
}

export async function fetchBalance(): Promise<BalanceData> {
  const { data } = await api.get("/api/v0/wallet/balance");
  return data.data as BalanceData;
}

export async function fetchRecipients(): Promise<Recipient[]> {
  const { data } = await api.get("/api/v0/wallet/recipients");
  return (data.data ?? []) as Recipient[];
}

export async function fetchTransactions(limit: number): Promise<Transaction[]> {
  const { data } = await api.get("/api/v0/wallet/transactions", {
    params: { limit },
  });
  return (data.data?.transactions ?? []) as Transaction[];
}

export async function fetchRecentTransactions(
  limit: number = 10,
): Promise<LedgerEntry[]> {
  const data = await getLedgerEntries({
    limit,
    offset: 0,
  });
  return data.entries;
}

let dashboardSummaryEndpointAvailable: boolean | null = null;

function toNumberString(value: unknown): string {
  if (typeof value === "string") return value;
  if (typeof value === "number" && Number.isFinite(value)) return String(value);
  return "0";
}

function normalizeDashboardSummaryFromBackend(
  payload: any,
): DashboardSummaryData {
  const balance = payload?.balance ?? payload?.wallet ?? payload ?? {};
  const stats = payload?.stats ?? payload?.summary?.stats ?? {};

  const totalIncome =
    payload?.totalIncome ??
    payload?.summary?.totalIncome ??
    stats?.totalIncome ??
    "0";

  const totalExpenses =
    payload?.totalExpenses ??
    payload?.summary?.totalExpenses ??
    stats?.totalExpenses ??
    "0";

  return {
    availableBalance: toNumberString(
      balance.availableBalance ?? balance.balance ?? payload?.availableBalance,
    ),
    totalBalance: toNumberString(
      balance.totalBalance ??
        balance.balance ??
        payload?.totalBalance ??
        payload?.availableBalance,
    ),
    currency: balance.currency ?? payload?.currency ?? "INR",
    status: balance.status ?? payload?.status ?? "ACTIVE",
    isFrozen: Boolean(balance.isFrozen ?? payload?.isFrozen ?? false),
    lastUpdated:
      balance.lastUpdated ?? payload?.lastUpdated ?? new Date().toISOString(),
    totalIncome: toNumberString(totalIncome),
    totalExpenses: toNumberString(totalExpenses),
    totalTransactions: Number(
      payload?.totalTransactions ??
        payload?.summary?.totalTransactions ??
        stats?.totalTransactions ??
        0,
    ),
    stats: stats as LedgerStatistics,
  };
}

function deriveIncomeAndExpenses(stats: LedgerStatistics) {
  const totalIncome =
    Number(stats?.p2p?.received?.totalAmount ?? 0) +
    Number(stats?.topups?.totalAmount ?? 0) +
    Number(stats?.merchant?.refunds?.totalAmount ?? 0);

  const totalExpenses =
    Number(stats?.p2p?.sent?.totalAmount ?? 0) +
    Number(stats?.merchant?.payments?.totalAmount ?? 0) +
    Number(stats?.requests?.totalAmount ?? 0);

  return {
    totalIncome: String(totalIncome),
    totalExpenses: String(totalExpenses),
  };
}

export async function fetchDashboardSummary(): Promise<DashboardSummaryData> {
  if (dashboardSummaryEndpointAvailable !== false) {
    try {
      const { data } = await api.get("/api/v0/wallet/dashboard/summary");
      dashboardSummaryEndpointAvailable = true;
      return normalizeDashboardSummaryFromBackend(data.data);
    } catch (error) {
      if (
        axios.isAxiosError(error) &&
        [404, 405, 501].includes(error.response?.status ?? 0)
      ) {
        dashboardSummaryEndpointAvailable = false;
      } else {
        throw error;
      }
    }
  }

  const [balance, stats] = await Promise.all([
    fetchBalance(),
    getLedgerStatistics(),
  ]);

  const { totalIncome, totalExpenses } = deriveIncomeAndExpenses(stats);

  return {
    availableBalance: balance.availableBalance,
    totalBalance: balance.totalBalance,
    currency: balance.currency,
    status: balance.status,
    isFrozen: balance.isFrozen,
    lastUpdated: balance.lastUpdated,
    totalIncome,
    totalExpenses,
    totalTransactions: stats.totalTransactions,
    stats,
  };
}

export function useCurrentUser(enabled: boolean = true) {
  return useQuery<UserData | null>({
    queryKey: qk.user,
    queryFn: fetchCurrentUser,
    staleTime: 1000 * 60 * 5,
    retry: false,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    enabled,
  });
}

export function useWalletBalance() {
  return useQuery<BalanceData>({
    queryKey: qk.balance,
    queryFn: fetchBalance,
    staleTime: 1000 * 30,
  });
}

export function useDashboardSummary() {
  return useQuery<DashboardSummaryData>({
    queryKey: qk.dashboardSummary,
    queryFn: fetchDashboardSummary,
    staleTime: 1000 * 30,
  });
}

export function useRecentRecipients() {
  return useQuery<Recipient[]>({
    queryKey: qk.recipients,
    queryFn: fetchRecipients,
    staleTime: 1000 * 60 * 5,
  });
}

export function useRecentTransactions(limit: number = 10) {
  return useQuery<LedgerEntry[]>({
    queryKey: qk.recentTransactions(limit),
    queryFn: () => fetchRecentTransactions(limit),
    staleTime: 1000 * 30,
  });
}

export function useAllTransactions() {
  return useQuery<Transaction[]>({
    queryKey: qk.allTransactions,
    queryFn: () => fetchTransactions(200),
    staleTime: 1000 * 30,
  });
}
