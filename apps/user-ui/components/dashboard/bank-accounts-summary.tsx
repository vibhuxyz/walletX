"use client";

import { useState, useCallback, memo } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  CreditCard,
  Star,
  ChevronDown,
  ChevronUp,
  Eye,
  EyeOff,
  Trash2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchLinkedAccounts, type BankAccount } from "@/lib/api/bankApi";
import { api } from "@/lib/api/client";
import { getApiError } from "@/lib/api/transfer";
import { qk } from "@/lib/wallet/useWalletQuery";
import BankSkeleton from "../skeleton/BankSkeleton";

interface AccountRowProps {
  account: BankAccount;
  index: number;
  isExpanded: boolean;
  showBalance: boolean;
  onToggleExpand: (id: string) => void;
  onToggleBalance: (id: string) => void;
  onSetDefault: (linkId: string) => void;
  onRemove: (linkId: string) => void;
  isSettingDefault: boolean;
  isRemoving: boolean;
}

const AccountRow = memo(function AccountRow({
  account,
  index,
  isExpanded,
  showBalance,
  onToggleExpand,
  onToggleBalance,
  onSetDefault,
  onRemove,
  isSettingDefault,
  isRemoving,
}: AccountRowProps) {
  const bankInitial = account.bankName.charAt(0).toUpperCase();

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.15 + index * 0.05 }}
    >
      {/* Bank row */}
      <button
        type="button"
        onClick={() => onToggleExpand(account.linkId)}
        className={`group flex w-full items-center gap-3 rounded-xl border p-3 text-left transition-all duration-200 ${
          isExpanded
            ? "border-primary/30 bg-primary/5"
            : "border-border/20 bg-secondary/30 hover:border-primary/20 hover:bg-secondary/50"
        }`}
      >
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-sm font-bold text-primary">
          {bankInitial}
        </div>
        <div className="flex-1 overflow-hidden">
          <p className="truncate text-sm font-semibold text-foreground">
            {account.bankName}
          </p>
          <p className="text-xs text-muted-foreground">
            {account.accountType} · {account.accountNumber}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {account.isDefault && (
            <Badge className="bg-primary/10 text-primary text-[10px] border-0">
              Default
            </Badge>
          )}
          <Badge
            className={`text-[10px] border-0 ${
              account.status === "ACTIVE"
                ? "bg-success/10 text-success"
                : "bg-warning/10 text-warning-foreground"
            }`}
          >
            {account.status}
          </Badge>
          {isExpanded ? (
            <ChevronUp className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          )}
        </div>
      </button>

      {/* Expanded details */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="mt-1 rounded-xl border border-border/20 bg-secondary/20 p-4">
              <div className="flex flex-col gap-3">
                {/* Account Number */}
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                    Account Number
                  </span>
                  <span className="font-mono text-xs font-medium text-foreground">
                    {account.accountNumber}
                  </span>
                </div>

                {/* Balance with eye toggle */}
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                    Balance
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-medium text-foreground">
                      {showBalance
                        ? `₹${parseFloat(account.balance).toLocaleString(
                            "en-IN",
                            {
                              minimumFractionDigits: 2,
                            },
                          )}`
                        : "••••••"}
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleBalance(account.linkId);
                      }}
                      className="text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showBalance ? (
                        <EyeOff className="h-3.5 w-3.5" />
                      ) : (
                        <Eye className="h-3.5 w-3.5" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Account Type */}
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                    Type
                  </span>
                  <span className="text-xs font-medium capitalize text-foreground">
                    {account.accountType.toLowerCase()}
                  </span>
                </div>

                {/* Status */}
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                    Status
                  </span>
                  <Badge
                    className={`text-[10px] border-0 ${
                      account.status === "ACTIVE"
                        ? "bg-success/10 text-success"
                        : "bg-warning/10 text-warning-foreground"
                    }`}
                  >
                    {account.status}
                  </Badge>
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-2 border-t border-border/20">
                  {!account.isDefault && (
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={isSettingDefault}
                      onClick={(e) => {
                        e.stopPropagation();
                        onSetDefault(account.linkId);
                      }}
                      className="h-8 gap-1.5 text-xs border-border/40 text-foreground hover:border-primary/30 hover:bg-primary/5"
                    >
                      <Star className="h-3.5 w-3.5" />
                      Set as Default
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={isRemoving}
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemove(account.linkId);
                    }}
                    className="h-8 gap-1.5 text-xs border-border/40 text-destructive hover:border-destructive/30 hover:bg-destructive/5"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Remove
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
});

// ─── Main Component ───────────────────────────────────────────────────────────

export function BankAccountsSummary() {
  const queryClient = useQueryClient();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [shownBalances, setShownBalances] = useState<Record<string, boolean>>(
    {},
  );

  // ── Fetch linked accounts ──────────────────────────────────────────────────
  const { data, isLoading } = useQuery({
    queryKey: qk.bankAccounts,
    queryFn: fetchLinkedAccounts,
    staleTime: 1000 * 30,
  });

  const accounts = data?.accounts ?? [];
  const canAdd = accounts.length < 3;

  // ── Set default mutation ───────────────────────────────────────────────────
  const setDefaultMutation = useMutation({
    mutationFn: (linkId: string) =>
      api.patch(`/api/v0/bank/accounts/${linkId}/set-default`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: qk.bankAccounts });
      toast.success("Default bank account updated");
    },
    onError: (err) => toast.error(getApiError(err)),
  });

  // ── Remove mutation ────────────────────────────────────────────────────────
  const removeMutation = useMutation({
    mutationFn: (linkId: string) =>
      api.delete(`/api/v0/bank/accounts/${linkId}`),
    onSuccess: (_, linkId) => {
      // Close expand panel if the removed account was open
      setExpandedId((prev) => (prev === linkId ? null : prev));
      queryClient.invalidateQueries({ queryKey: qk.bankAccounts });
      const removed = accounts.find((a) => a.linkId === linkId);
      toast.success(`${removed?.bankName ?? "Bank account"} removed`);
    },
    onError: (err) => toast.error(getApiError(err)),
  });

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleToggleExpand = useCallback((id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  }, []);

  const handleToggleBalance = useCallback((id: string) => {
    setShownBalances((prev) => ({ ...prev, [id]: !prev[id] }));
  }, []);

  const handleSetDefault = useCallback(
    (linkId: string) => setDefaultMutation.mutate(linkId),
    [setDefaultMutation],
  );

  const handleRemove = useCallback(
    (linkId: string) => removeMutation.mutate(linkId),
    [removeMutation],
  );

  if (isLoading) return <BankSkeleton />;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
    >
      <Card className="border-border/30 bg-card">
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <CreditCard className="h-4 w-4 text-primary" />
            Linked Banks
            <Badge
              variant="secondary"
              className="text-[10px] bg-secondary text-muted-foreground border-0"
            >
              {accounts.length}/3
            </Badge>
          </CardTitle>
          {canAdd ? (
            <Link
              href="/dashboard/add-bank-account"
              className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold text-primary transition-colors hover:bg-primary/10"
            >
              <Plus className="h-3 w-3" />
              Add
            </Link>
          ) : (
            <span className="text-[10px] text-muted-foreground">
              Max 3 reached
            </span>
          )}
        </CardHeader>

        <CardContent>
          <div className="flex flex-col gap-2">
            {accounts.map((account, i) => (
              <AccountRow
                key={account.linkId}
                account={account}
                index={i}
                isExpanded={expandedId === account.linkId}
                showBalance={!!shownBalances[account.linkId]}
                onToggleExpand={handleToggleExpand}
                onToggleBalance={handleToggleBalance}
                onSetDefault={handleSetDefault}
                onRemove={handleRemove}
                isSettingDefault={
                  setDefaultMutation.isPending &&
                  setDefaultMutation.variables === account.linkId
                }
                isRemoving={
                  removeMutation.isPending &&
                  removeMutation.variables === account.linkId
                }
              />
            ))}

            {accounts.length === 0 && (
              <div className="flex flex-col items-center gap-2 py-6 text-center">
                <CreditCard className="h-8 w-8 text-muted-foreground/30" />
                <p className="text-xs text-muted-foreground">
                  No bank accounts linked
                </p>
                <Link href="/dashboard/add-bank-account">
                  <Button
                    size="sm"
                    className="mt-1 h-8 bg-primary text-primary-foreground text-xs"
                  >
                    <Plus className="mr-1.5 h-3 w-3" />
                    Add Bank Account
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
