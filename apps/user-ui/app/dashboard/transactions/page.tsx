"use client";

import { useState, useMemo, useEffect, useDeferredValue } from "react";
import dynamic from "next/dynamic";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Download,
  Filter,
  ChevronLeft,
  ChevronRight,
  RefreshCcw,
  MessageSquareQuote,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TxAvatar } from "@/components/dashboard/tx-avatar";
import {
  getLedgerEntries,
  getLedgerStatistics,
  type LedgerEntry,
} from "@/lib/api/ledgerApi";
import { qk } from "@/lib/wallet/useWalletQuery";
import StatsSkeleton from "@/components/skeleton/StatsSkeleton";
import ListSkeleton from "@/components/skeleton/ListSkeleton";

const TransactionDetailsDrawer = dynamic(
  () =>
    import("@/components/dashboard/transaction-details-drawer").then(
      (mod) => mod.TransactionDetailsDrawer,
    ),
  {
    loading: () => null,
  },
);

// ── Constants ─────────────────────────────────────────────────────────────────

const ITEMS_PER_PAGE = 20;

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatGroupDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function parseAmount(amountStr: string): number {
  return parseFloat(amountStr.replace(/[^0-9.-]+/g, ""));
}

export default function TransactionsPage() {
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedTransaction, setSelectedTransaction] =
    useState<LedgerEntry | null>(null);
  const deferredSearch = useDeferredValue(search);

  //  Fetch Ledger Entries
  const {
    data: ledgerData,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: qk.ledgerList(currentPage, categoryFilter, statusFilter),
    queryFn: () =>
      getLedgerEntries({
        limit: ITEMS_PER_PAGE,
        offset: (currentPage - 1) * ITEMS_PER_PAGE,
        category: categoryFilter !== "all" ? categoryFilter : undefined,
        status: statusFilter !== "all" ? statusFilter : undefined,
      }),
    staleTime: 1000 * 30,
  });

  //  Fetch Statistics
  const { data: statsData, isLoading: statsLoading } = useQuery({
    queryKey: qk.ledgerStats,
    queryFn: () => getLedgerStatistics(),
    staleTime: 1000 * 60,
  });

  const entries = ledgerData?.entries ?? [];
  const pagination = ledgerData?.pagination;

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [search, categoryFilter, statusFilter]);

  // Client-side search filtering
  const filtered = useMemo(() => {
    if (!deferredSearch) return entries;

    const q = deferredSearch.toLowerCase();
    return entries.filter((tx) => {
      const title = tx.title.toLowerCase();
      const subtitle = tx.subtitle.toLowerCase();
      const note = tx.note?.toLowerCase() || "";
      const email =
        tx.sender?.email?.toLowerCase() ||
        tx.recipient?.email?.toLowerCase() ||
        "";

      return (
        title.includes(q) ||
        subtitle.includes(q) ||
        note.includes(q) ||
        email.includes(q)
      );
    });
  }, [entries, deferredSearch]);

  //  Grouping
  const grouped = useMemo(() => {
    const groups: Record<string, LedgerEntry[]> = {};
    for (const tx of filtered) {
      const key = formatGroupDate(tx.createdAt);
      if (!groups[key]) groups[key] = [];
      groups[key].push(tx);
    }
    return Object.entries(groups);
  }, [filtered]);

  // Stats Calculation
  const { totalIncome, totalExpenses, netFlow } = useMemo(() => {
    if (!statsData) return { totalIncome: 0, totalExpenses: 0, netFlow: 0 };

    const income =
      parseAmount(statsData.p2p.received.totalAmount) +
      parseAmount(statsData.topups.totalAmount) +
      parseAmount(statsData.merchant.refunds.totalAmount);

    const expenses =
      parseAmount(statsData.p2p.sent.totalAmount) +
      parseAmount(statsData.merchant.payments.totalAmount) +
      parseAmount(statsData.requests.totalAmount);

    return {
      totalIncome: income,
      totalExpenses: expenses,
      netFlow: income - expenses,
    };
  }, [statsData]);

  //  Pagination Logic
  const totalPages = pagination
    ? Math.max(1, Math.ceil(pagination.total / ITEMS_PER_PAGE))
    : 1;

  const pageNumbers = useMemo((): (number | "…")[] => {
    if (totalPages <= 7)
      return Array.from({ length: totalPages }, (_, i) => i + 1);

    const visible = Array.from({ length: totalPages }, (_, i) => i + 1).filter(
      (p) => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1,
    );

    const result: (number | "…")[] = [];
    visible.forEach((p, idx) => {
      if (idx > 0 && p - visible[idx - 1] > 1) result.push("…");
      result.push(p);
    });
    return result;
  }, [totalPages, currentPage]);

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="mx-auto max-w-6xl"
      >
        {/* Header */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Transactions</h1>
            <p className="text-sm text-muted-foreground">
              View and manage all your financial activities
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              className="border-border/40 bg-secondary/50"
            >
              <RefreshCcw className="mr-2 h-4 w-4" />
              Refresh
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="border-border/40 bg-secondary/50 text-foreground hover:bg-secondary"
            >
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
          </div>
        </div>

        {/* Stats */}
        {statsLoading ? (
          <StatsSkeleton />
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-6 grid gap-3 sm:grid-cols-3"
          >
            <Card className="border-border/30 bg-card">
              <CardContent className="p-5">
                <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                  Total Income
                </p>
                <p className="mt-2 text-2xl font-bold text-green-600">
                  +₹{totalIncome.toLocaleString("en-IN")}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {statsData?.p2p.received.count || 0} received •{" "}
                  {statsData?.topups.successCount || 0} topups
                </p>
              </CardContent>
            </Card>
            <Card className="border-border/30 bg-card">
              <CardContent className="p-5">
                <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                  Total Expenses
                </p>
                <p className="mt-2 text-2xl font-bold text-red-600">
                  -₹{totalExpenses.toLocaleString("en-IN")}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {statsData?.p2p.sent.count || 0} sent •{" "}
                  {statsData?.merchant.payments.count || 0} merchant
                </p>
              </CardContent>
            </Card>
            <Card className="border-border/30 bg-card">
              <CardContent className="p-5">
                <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                  Net Flow
                </p>
                <p
                  className={`mt-2 text-2xl font-bold ${netFlow >= 0 ? "text-primary" : "text-destructive"}`}
                >
                  {netFlow >= 0 ? "+" : "-"}₹
                  {Math.abs(netFlow).toLocaleString("en-IN")}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {statsData?.totalTransactions || 0} total transactions
                </p>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="mb-6 flex flex-col gap-3 sm:flex-row"
        >
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search name, note, or email..."
              className="pl-10 bg-secondary/50 border-border/30"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search !== deferredSearch && (
              <p className="mt-2 text-xs text-muted-foreground">
                Updating results...
              </p>
            )}
          </div>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-full sm:w-40 bg-secondary/50 border-border/30">
              <Filter className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="topup">Top Up</SelectItem>
              <SelectItem value="p2p">P2P Transfers</SelectItem>
              <SelectItem value="merchant">Merchant</SelectItem>
              <SelectItem value="request">Requests</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-40 bg-secondary/50 border-border/30">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="SUCCESS">Success</SelectItem>
              <SelectItem value="PENDING">Pending</SelectItem>
              <SelectItem value="FAILED">Failed</SelectItem>
            </SelectContent>
          </Select>
        </motion.div>

        {/* Transaction list */}
        {isLoading ? (
          <ListSkeleton />
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={`page-${currentPage}-${categoryFilter}-${statusFilter}-${search}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="flex flex-col gap-6"
            >
              {grouped.length === 0 ? (
                <div className="py-16 text-center">
                  <Search className="mx-auto mb-3 h-10 w-10 text-muted-foreground/20" />
                  <p className="text-lg font-medium text-muted-foreground">
                    No transactions found
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Try adjusting your filters.
                  </p>
                </div>
              ) : (
                grouped.map(([date, txs]) => (
                  <div key={date}>
                    {/* Date separator */}
                    <div className="mb-2 flex items-center gap-3">
                      <p className="whitespace-nowrap text-sm font-semibold text-muted-foreground">
                        {date}
                      </p>
                      <div className="h-px flex-1 bg-border/40" />
                    </div>

                    <div className="flex flex-col gap-0.5">
                      {txs.map((tx) => {
                        //  Status-based styling logic
                        const getAmountStyle = () => {
                          if (tx.status === "FAILED") {
                            return {
                              color: "text-red-600",
                              prefix: "",
                            };
                          }
                          if (tx.status === "PENDING") {
                            return {
                              color: "text-yellow-600",
                              prefix: "",
                            };
                          }
                          // SUCCESS
                          if (tx.isIncoming) {
                            return {
                              color: "text-green-600",
                              prefix: "+",
                            };
                          }
                          return {
                            color: "text-foreground",
                            prefix: "-",
                          };
                        };

                        const amountStyle = getAmountStyle();

                        return (
                          <button
                            key={tx.transactionId}
                            type="button"
                            onClick={() => setSelectedTransaction(tx)}
                            className="flex w-full items-center gap-4 rounded-xl px-4 py-3.5 text-left transition-colors hover:bg-secondary/40"
                          >
                            {/* Avatar with status */}
                            <TxAvatar
                              name={tx.title}
                              size="md"
                              isIncome={tx.isIncoming}
                              status={tx.status}
                            />

                            {/* Info */}
                            <div className="flex-1 overflow-hidden">
                              <p className="truncate text-sm font-semibold text-foreground">
                                {tx.title}
                              </p>
                              <div className="flex flex-col gap-0.5 mt-0.5">
                                {/* Subtitle & Ref ID */}
                                <p className="text-xs text-muted-foreground flex items-center gap-1">
                                  <span>{tx.subtitle}</span>
                                  <span className="opacity-50 text-[10px] hidden sm:inline-block">
                                    • Ref: {tx.referenceId.slice(-8)}
                                  </span>
                                </p>

                                {/* Note Display */}
                                {tx.note && (
                                  <p className="flex items-center gap-1.5 text-xs text-muted-foreground/80 italic truncate">
                                    <MessageSquareQuote className="h-3 w-3 opacity-50" />
                                    <span>{tx.note}</span>
                                  </p>
                                )}
                              </div>
                            </div>

                            {/* Amount & Status */}
                            <div className="flex flex-col items-end gap-1">
                              <div className="flex items-center gap-2">
                                <Badge
                                  variant="secondary"
                                  className={`hidden sm:inline-flex text-[10px] uppercase h-5
                                    ${tx.status === "SUCCESS" ? "bg-green-500/10 text-green-600 hover:bg-green-500/20" : ""}
                                    ${tx.status === "PENDING" ? "bg-yellow-500/10 text-yellow-600 hover:bg-yellow-500/20" : ""}
                                    ${tx.status === "FAILED" ? "bg-red-500/10 text-red-600 hover:bg-red-500/20" : ""}
                                  `}
                                >
                                  {tx.status}
                                </Badge>

                                {/*  Amount with proper prefix and color */}
                                <p
                                  className={`text-sm font-bold ${amountStyle.color}`}
                                >
                                  {amountStyle.prefix}₹{tx.amount}
                                </p>
                              </div>

                              <p className="text-[10px] text-muted-foreground">
                                Bal: ₹{tx.balanceAfter}
                              </p>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))
              )}
            </motion.div>
          </AnimatePresence>
        )}

        {/* Pagination Controls */}
        {!isLoading && pagination && pagination.total > ITEMS_PER_PAGE && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-8 flex items-center justify-between"
          >
            <p className="text-sm text-muted-foreground">
              Showing {pagination.offset + 1}–
              {Math.min(pagination.offset + ITEMS_PER_PAGE, pagination.total)}{" "}
              of {pagination.total}
            </p>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                className="h-9 w-9 border-border/40 bg-secondary/50 text-foreground hover:bg-secondary"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>

              {pageNumbers.map((p, idx) =>
                p === "…" ? (
                  <span
                    key={`ellipsis-${idx}`}
                    className="px-1 text-sm text-muted-foreground"
                  >
                    …
                  </span>
                ) : (
                  <Button
                    key={p}
                    variant={p === currentPage ? "default" : "outline"}
                    size="icon"
                    className={`h-9 w-9 ${
                      p === currentPage
                        ? "bg-primary text-primary-foreground"
                        : "border-border/40 bg-secondary/50 text-foreground hover:bg-secondary"
                    }`}
                    onClick={() => setCurrentPage(p as number)}
                  >
                    {p}
                  </Button>
                ),
              )}

              <Button
                variant="outline"
                size="icon"
                className="h-9 w-9 border-border/40 bg-secondary/50 text-foreground hover:bg-secondary"
                disabled={!pagination.hasMore}
                onClick={() =>
                  setCurrentPage((p) => Math.min(totalPages, p + 1))
                }
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </motion.div>
        )}
      </motion.div>

      {/* Transaction Details Drawer */}
      {selectedTransaction && (
        <TransactionDetailsDrawer
          transaction={selectedTransaction}
          onClose={() => setSelectedTransaction(null)}
        />
      )}
    </>
  );
}
