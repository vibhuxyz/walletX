"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { ArrowUpFromLine, Loader2, Landmark } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatCurrency } from "@/lib/constants";
import { KycGate } from "@/components/shared/kyc-gate";
import { fetchLinkedAccounts } from "@/lib/api/bankApi";
import { withdrawToBank } from "@/lib/api/withdrawApi";
import { getLedgerEntries } from "@/lib/api/ledgerApi";
import { qk, useWalletBalance } from "@/lib/wallet/useWalletQuery";

type ApiErrorResponse = {
  message?: string;
  code?: string;
  error?:
    | string
    | {
        code?: string;
        message?: string;
      };
};

function getErrorMessage(data: ApiErrorResponse | undefined, fallback: string) {
  if (!data) return fallback;
  if (data.error && typeof data.error === "object") {
    return data.error.message || data.error.code || fallback;
  }
  return data.message || data.code || fallback;
}

function WithdrawContent() {
  const queryClient = useQueryClient();
  const { data: balanceData } = useWalletBalance();
  const currentBalance = parseFloat(balanceData?.availableBalance ?? "0");

  const [selectedAccountId, setSelectedAccountId] = useState("");
  const [amount, setAmount] = useState("");
  const [pin, setPin] = useState("");
  const [note, setNote] = useState("");

  const { data: accountsData, isLoading: accountsLoading } = useQuery({
    queryKey: qk.bankAccounts,
    queryFn: fetchLinkedAccounts,
    staleTime: 1000 * 60 * 5,
  });

  const linkedAccounts = accountsData?.accounts ?? [];

  const selectedAccount = useMemo(
    () => linkedAccounts.find((a) => a.linkId === selectedAccountId) ?? null,
    [linkedAccounts, selectedAccountId],
  );

  useEffect(() => {
    if (!linkedAccounts.length) return;
    if (selectedAccountId) return;
    const defaultAccount =
      linkedAccounts.find((a) => a.isDefault) ?? linkedAccounts[0];
    setSelectedAccountId(defaultAccount.linkId);
  }, [linkedAccounts, selectedAccountId]);

  const { data: withdrawalsData, isLoading: withdrawalsLoading } = useQuery({
    queryKey: qk.ledgerWithdrawals(8),
    queryFn: () =>
      getLedgerEntries({
        type: "ADMIN_ADJUSTMENT",
        limit: 8,
        offset: 0,
      }),
    staleTime: 1000 * 30,
  });

  const withdrawals = (withdrawalsData?.entries ?? []).filter(
    (entry) => entry.metadata?.kind === "WITHDRAWAL",
  );

  const withdrawMutation = useMutation({
    mutationFn: withdrawToBank,
    onSuccess: (data) => {
      toast.success(
        `₹${parseFloat(data.amount).toLocaleString("en-IN")} withdrawn to ${data.bankAccount.bankName}`,
      );
      setAmount("");
      setPin("");
      setNote("");
      queryClient.invalidateQueries({ queryKey: qk.balance });
      queryClient.invalidateQueries({ queryKey: qk.dashboardSummary });
      queryClient.invalidateQueries({ queryKey: qk.ledgerRoot });
      queryClient.invalidateQueries({ queryKey: qk.ledgerAnalyticsRoot });
    },
    onError: (err: AxiosError<ApiErrorResponse>) => {
      toast.error(getErrorMessage(err.response?.data, "Withdraw failed"));
    },
  });

  function handleWithdraw() {
    const parsedAmount = Number(amount);

    if (!selectedAccountId) {
      toast.error("Please select a bank account");
      return;
    }

    if (!amount || Number.isNaN(parsedAmount) || parsedAmount <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    if (parsedAmount > currentBalance) {
      toast.error("Amount exceeds available wallet balance");
      return;
    }

    if (pin.length !== 4) {
      toast.error("PIN must be 4 digits");
      return;
    }

    withdrawMutation.mutate({
      linkedAccountId: selectedAccountId,
      amount,
      pin,
      note: note.trim() || undefined,
    });
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Withdraw to Bank</h1>
        <p className="text-sm text-muted-foreground">
          Move money from your wallet to your linked bank account.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2 border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <ArrowUpFromLine className="h-5 w-5 text-primary" />
              Withdraw Funds
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="rounded-xl bg-primary/10 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Available Balance
              </p>
              <p className="mt-1 text-2xl font-bold text-foreground">
                {formatCurrency(currentBalance)}
              </p>
            </div>

            {accountsLoading ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading bank accounts...
              </div>
            ) : linkedAccounts.length === 0 ? (
              <div className="rounded-xl border border-dashed border-border p-6 text-center">
                <p className="font-medium text-foreground">
                  No linked bank account
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Link a bank account first to withdraw your wallet balance.
                </p>
                <Button asChild className="mt-4">
                  <Link href="/dashboard/add-bank-account">
                    Link Bank Account
                  </Link>
                </Button>
              </div>
            ) : (
              <>
                <div className="space-y-2">
                  <Label htmlFor="bank">To bank account</Label>
                  <select
                    id="bank"
                    value={selectedAccountId}
                    onChange={(e) => setSelectedAccountId(e.target.value)}
                    className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                  >
                    {linkedAccounts.map((account) => (
                      <option key={account.linkId} value={account.linkId}>
                        {account.bankName} · {account.accountNumber} ·{" "}
                        {account.accountType}
                      </option>
                    ))}
                  </select>
                  {selectedAccount && (
                    <p className="text-xs text-muted-foreground">
                      Destination: {selectedAccount.bankName} (
                      {selectedAccount.accountNumber})
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="amount">Amount (INR)</Label>
                  <Input
                    id="amount"
                    inputMode="decimal"
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) =>
                      setAmount(e.target.value.replace(/[^\d.]/g, ""))
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="pin">Wallet PIN</Label>
                  <Input
                    id="pin"
                    type="password"
                    inputMode="numeric"
                    maxLength={4}
                    placeholder="••••"
                    value={pin}
                    onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="note">Note (optional)</Label>
                  <Input
                    id="note"
                    placeholder="e.g. Transfer to salary account"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    maxLength={140}
                  />
                </div>

                <Button
                  onClick={handleWithdraw}
                  disabled={
                    withdrawMutation.isPending ||
                    linkedAccounts.length === 0 ||
                    currentBalance <= 0
                  }
                  className="w-full bg-primary text-primary-foreground"
                >
                  {withdrawMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    "Withdraw to Bank"
                  )}
                </Button>
              </>
            )}
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Landmark className="h-4 w-4 text-primary" />
              Recent Withdrawals
            </CardTitle>
          </CardHeader>
          <CardContent>
            {withdrawalsLoading ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading...
              </div>
            ) : withdrawals.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No withdrawals yet.
              </p>
            ) : (
              <div className="space-y-3">
                {withdrawals.map((entry) => (
                  <div
                    key={entry.transactionId}
                    className="rounded-lg border border-border/60 p-3"
                  >
                    <p className="text-sm font-semibold text-foreground">
                      ₹{parseFloat(entry.amount).toLocaleString("en-IN")}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {entry.bankDetails?.bankName ?? "Bank transfer"} ·{" "}
                      {entry.bankDetails?.accountNumber ?? ""}
                    </p>
                    <p className="mt-1 text-[11px] text-muted-foreground">
                      {new Date(entry.createdAt).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function WithdrawPage() {
  return (
    <KycGate featureName="Withdraw Funds">
      <WithdrawContent />
    </KycGate>
  );
}
