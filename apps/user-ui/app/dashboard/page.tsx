"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import {
  useCurrentUser,
  useDashboardSummary,
} from "@/lib/wallet/useWalletQuery";
import { KycBanner } from "@/components/dashboard/kyc-banner";
import { PinBanner } from "@/components/dashboard/pin-banner";
import { BalanceOverview } from "@/components/dashboard/balance-overview";
import { QuickActions } from "@/components/dashboard/quick-actions";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, ShieldAlert, ShieldCheck } from "lucide-react";

const PaymentRequests = dynamic(
  () =>
    import("@/components/dashboard/payment-requests").then(
      (mod) => mod.PaymentRequests,
    ),
  {
    loading: () => (
      <DashboardWidgetFallback title="Payment Requests" className="mb-6" />
    ),
  },
);

const BankAccountsSummary = dynamic(
  () =>
    import("@/components/dashboard/bank-accounts-summary").then(
      (mod) => mod.BankAccountsSummary,
    ),
  {
    loading: () => <DashboardWidgetFallback title="Linked Banks" />,
  },
);

const QuickTransfer = dynamic(
  () =>
    import("@/components/dashboard/quick-transfer").then(
      (mod) => mod.QuickTransfer,
    ),
  {
    loading: () => <DashboardWidgetFallback title="Quick Transfer" />,
  },
);

const RecentTransactions = dynamic(
  () =>
    import("@/components/dashboard/recent-transactions").then(
      (mod) => mod.RecentTransactions,
    ),
  {
    loading: () => <DashboardWidgetFallback title="Recent Transactions" />,
  },
);

function DashboardWidgetFallback({
  title,
  className = "",
}: {
  title: string;
  className?: string;
}) {
  return (
    <Card className={`border-border/30 bg-card ${className}`.trim()}>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent className="flex min-h-40 items-center justify-center">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading...
        </div>
      </CardContent>
    </Card>
  );
}

export default function DashboardPage() {
  const [balanceHidden, setBalanceHidden] = useState(false);

  const { data: user } = useCurrentUser();
  const { data: summary } = useDashboardSummary();

  const walletStatus = user?.wallet?.status ?? summary?.status;
  const isKycComplete = walletStatus === "ACTIVE";
  const isPinPending = walletStatus === "PENDING_PIN";
  const isKycPending = walletStatus === "PENDING_KYC";
  const isWalletLocked = !isKycComplete;

  const firstName = user?.fullName?.split(" ")[0] ?? "there";
  const availableBalance = summary?.availableBalance
    ? parseFloat(summary.availableBalance)
    : undefined;
  const totalIncome = summary?.totalIncome
    ? parseFloat(summary.totalIncome)
    : 0;
  const totalExpenses = summary?.totalExpenses
    ? parseFloat(summary.totalExpenses)
    : 0;

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Welcome back, {firstName}
          </h1>
          <p className="text-sm text-muted-foreground">
            {"Here's what's happening with your wallet today."}
          </p>
        </div>

        {isKycComplete ? (
          <Badge className="gap-1.5 border-success/20 bg-success/10 py-1 text-success">
            <ShieldCheck className="h-3 w-3" />
            Verified
          </Badge>
        ) : (
          <div className="flex items-center gap-2">
            <Badge className="gap-1.5 border-destructive/20 bg-destructive/10 py-1 text-destructive">
              <ShieldAlert className="h-3 w-3" />
              Not Verified
            </Badge>
            <Badge
              variant="outline"
              className="border-destructive/30 py-1 text-destructive"
            >
              Frozen
            </Badge>
          </div>
        )}
      </div>

      {isPinPending && (
        <div className="mb-6">
          <PinBanner />
        </div>
      )}

      {isKycPending && (
        <div className="mb-6">
          <KycBanner />
        </div>
      )}

      <PaymentRequests />

      <div className="mt-6 flex flex-col gap-6">
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <BalanceOverview
              hidden={balanceHidden}
              onToggle={() => setBalanceHidden((prev) => !prev)}
              kycLocked={isWalletLocked}
              realBalance={availableBalance}
              realWalletId={user?.wallet?.id}
              realCurrency={summary?.currency}
              totalIncome={totalIncome}
              totalExpenses={totalExpenses}
            />
          </div>

          <div className="lg:col-span-1">
            <BankAccountsSummary />
          </div>
        </div>

        {isKycComplete && <QuickActions />}

        {isKycComplete ? (
          <div className="grid gap-6 lg:grid-cols-5">
            <div className="lg:col-span-2">
              <QuickTransfer />
            </div>
            <div className="lg:col-span-3">
              <RecentTransactions />
            </div>
          </div>
        ) : (
          <RecentTransactions />
        )}
      </div>
    </div>
  );
}
