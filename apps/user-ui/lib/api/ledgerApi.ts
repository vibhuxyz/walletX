import { api } from "@/lib/api/client";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface LedgerEntry {
  transactionId: string;
  referenceId: string;
  type: string;
  title: string;
  subtitle: string;
  amount: string;
  balanceBefore: string;
  balanceAfter: string;
  description: string;
  isIncoming: boolean;
  icon: string;
  category: string;
  status: "SUCCESS" | "FAILED" | "PENDING";
  createdAt: string;

  // Optional fields based on transaction type
  orderId?: string;
  transferId?: string;
  requestId?: string;
  paymentId?: string;
  refundId?: string;
  adminId?: string;

  // Related users
  sender?: {
    id: string;
    name: string;
    email: string;
    phone: string;
  };
  recipient?: {
    id: string;
    name: string;
    email: string;
    phone: string;
  };

  // Bank details (for topups)
  bankDetails?: {
    bankName: string;
    accountNumber: string;
  };

  // Merchant details
  merchant?: {
    id: string;
    businessName: string;
    businessType: string;
  };

  // Additional info
  note?: string;
  reason?: string;
  refundReason?: string;
  adjustmentReason?: string;
  failureReason?: string;
  commission?: string;
  metadata?: any;
}

export interface LedgerPagination {
  total: number;
  limit: number;
  offset: number;
  hasMore: boolean;
  nextCursor?: string;
}

export interface LedgerEntriesResponse {
  entries: LedgerEntry[];
  pagination: LedgerPagination;
}

export interface LedgerStatistics {
  totalTransactions: number;
  topups: {
    count: number;
    totalAmount: string;
    successCount: number;
    failedCount: number;
  };
  p2p: {
    sent: {
      count: number;
      totalAmount: string;
    };
    received: {
      count: number;
      totalAmount: string;
    };
  };
  merchant: {
    payments: {
      count: number;
      totalAmount: string;
    };
    refunds: {
      count: number;
      totalAmount: string;
    };
  };
  requests: {
    count: number;
    totalAmount: string;
  };
}

export interface LedgerStatisticsResponse {
  data: LedgerStatistics;
}

export interface LedgerAnalyticsSummary {
  totalIncome: string;
  totalExpenses: string;
  totalSpending: string;
  netFlow: string;
  averageMonthlyIncome: string;
  averageMonthlyExpenses: string;
}

export interface LedgerAnalyticsMonthly {
  month: string;
  income: string;
  expense: string;
  net: string;
}

export interface LedgerAnalyticsCategory {
  name: string;
  amount: string;
  percentage: number;
  transactionCount: number;
}

export interface LedgerAnalytics {
  period: {
    months: number;
    startDate: string;
    endDate: string;
  };
  summary: LedgerAnalyticsSummary;
  monthly: LedgerAnalyticsMonthly[];
  categories: LedgerAnalyticsCategory[];
  totals: {
    successfulTransactions: number;
  };
}

// ─── API Functions ────────────────────────────────────────────────────────────

export async function getLedgerEntries(
  options: {
    limit?: number;
    offset?: number;
    cursor?: string;
    type?: string;
    category?: string;
    status?: string;
    startDate?: string;
    endDate?: string;
  } = {},
): Promise<LedgerEntriesResponse> {
  const { data } = await api.get("/api/v0/wallet/ledger", {
    params: options,
  });
  return data.data as LedgerEntriesResponse;
}

export async function getLedgerEntryDetails(
  entryId: string,
): Promise<LedgerEntry> {
  const { data } = await api.get(`/api/v0/wallet/ledger/${entryId}`);
  return data.data as LedgerEntry;
}

export async function getLedgerStatistics(
  startDate?: string,
  endDate?: string,
): Promise<LedgerStatistics> {
  const { data } = await api.get("/api/v0/wallet/ledger/stats/summary", {
    params: { startDate, endDate },
  });
  return data.data as LedgerStatistics;
}

export async function getLedgerAnalytics(
  months: number = 6,
): Promise<LedgerAnalytics> {
  const { data } = await api.get("/api/v0/wallet/ledger/stats/analytics", {
    params: { months },
  });
  return data.data as LedgerAnalytics;
}
