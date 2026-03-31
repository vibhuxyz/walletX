"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TxAvatar } from "./tx-avatar";
import { formatDate } from "@/lib/constants";
import { useRecentTransactions } from "@/lib/wallet/useWalletQuery";
import TransactionsSkeleton from "../skeleton/TransactionsSkeleton";
import type { LedgerEntry } from "@/lib/api/ledgerApi";

// ── Component ─────────────────────────────────────────────────────────────────
export function RecentTransactions() {
  const { data: transactions, isLoading } = useRecentTransactions(10);

  if (isLoading) return <TransactionsSkeleton />;

  const recent = (transactions ?? []).slice(0, 6);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <Card className="border-border/30 bg-card">
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <CardTitle className="text-base">Recent Transactions</CardTitle>
          <Link
            href="/dashboard/transactions"
            className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold text-primary transition-colors hover:bg-primary/10"
          >
            View all
            <ArrowRight className="h-3 w-3" />
          </Link>
        </CardHeader>
        <CardContent>
          {recent.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-10 text-center">
              <ArrowUpRight className="h-8 w-8 text-muted-foreground/30" />
              <p className="text-sm font-medium text-muted-foreground">
                No transactions yet
              </p>
              <p className="text-xs text-muted-foreground/60">
                Your transactions will appear here once you start using your
                wallet.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-0.5">
              {recent.map((tx: LedgerEntry, i) => {
                // ✅ Use isIncoming from ledger entry
                const isIncoming = tx.isIncoming;

                // ✅ Clean amount (already formatted from API)
                const cleanAmount = tx.amount;

                // ✅ Status-based styling logic
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
                  if (isIncoming) {
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
                  <motion.div
                    key={tx.transactionId}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.25 + i * 0.04 }}
                    className="flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors hover:bg-secondary/40"
                  >
                    {/* ✅ Avatar with status prop */}
                    <TxAvatar
                      name={tx.title}
                      size="sm"
                      isIncome={isIncoming}
                      status={tx.status}
                    />

                    <div className="flex-1 overflow-hidden">
                      <p className="truncate text-sm font-semibold text-foreground">
                        {tx.title}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(tx.createdAt)}
                      </p>
                    </div>

                    <div className="flex flex-col items-end gap-1">
                      {/* ✅ Amount with proper prefix and color */}
                      <p className={`text-sm font-bold ${amountStyle.color}`}>
                        {amountStyle.prefix}₹{cleanAmount}
                      </p>

                      {/* ✅ Status badge with proper colors */}
                      <Badge
                        variant="secondary"
                        className={`text-[10px] uppercase h-5
                          ${tx.status === "SUCCESS" ? "bg-green-500/10 text-green-600 hover:bg-green-500/20" : ""}
                          ${tx.status === "PENDING" ? "bg-yellow-500/10 text-yellow-600 hover:bg-yellow-500/20" : ""}
                          ${tx.status === "FAILED" ? "bg-red-500/10 text-red-600 hover:bg-red-500/20" : ""}
                        `}
                      >
                        {tx.status}
                      </Badge>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
