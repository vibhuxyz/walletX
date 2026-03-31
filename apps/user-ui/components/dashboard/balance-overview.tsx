"use client";

import { useState } from "react";
import {
  Eye,
  EyeOff,
  TrendingUp,
  ArrowUpRight,
  ArrowDownLeft,
  Lock,
  Copy,
  CheckCheck,
} from "lucide-react";
import { formatCurrency } from "@/lib/constants";
import { toast } from "sonner";

interface BalanceOverviewProps {
  hidden?: boolean;
  onToggle?: () => void;
  kycLocked?: boolean;
  realBalance?: number;
  realWalletId?: string;
  realCurrency?: string;
  totalIncome?: number;
  totalExpenses?: number;
}

export function BalanceOverview({
  hidden = false,
  onToggle,
  kycLocked = false,
  realBalance,
  realWalletId,
  realCurrency,
  totalIncome = 0,
  totalExpenses = 0,
}: BalanceOverviewProps) {
  const [copied, setCopied] = useState(false);

  const displayBalance = realBalance ?? 0;
  const displayWalletId = realWalletId ?? "—";
  const displayCurrency = realCurrency ?? "INR";

  function copyWalletId() {
    if (!realWalletId) return;

    navigator.clipboard.writeText(realWalletId);
    setCopied(true);
    toast.success("Wallet ID copied!");

    window.setTimeout(() => {
      setCopied(false);
    }, 2000);
  }

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#172054] via-[#2d2165] to-[#592686] p-6 shadow-xl md:p-8">
      <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-white/5 blur-3xl" />
      <div className="absolute -bottom-10 right-20 h-32 w-32 rounded-full bg-white/5 blur-2xl" />
      <div className="absolute left-0 top-0 h-px w-full bg-gradient-to-r from-transparent via-white/20 to-transparent" />

      <div className="relative z-10">
        <div className="mb-4 flex items-center gap-2">
          <span className="text-[10px] font-semibold uppercase tracking-widest text-white/60">
            Wallet ID
          </span>

          <button
            type="button"
            onClick={copyWalletId}
            className="flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-mono text-white/90 shadow-sm backdrop-blur-sm transition-colors hover:bg-white/20"
          >
            {displayWalletId}
            {copied ? (
              <CheckCheck className="h-3 w-3 text-[#1FCB71]" />
            ) : (
              <Copy className="h-3 w-3 text-white/60" />
            )}
          </button>

          <span className="ml-auto rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[10px] font-semibold text-white shadow-sm backdrop-blur-sm">
            {displayCurrency}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold uppercase tracking-widest text-white/60">
            Total Balance
          </p>

          {!kycLocked && (
            <button
              type="button"
              onClick={onToggle}
              className="rounded-full border border-white/10 bg-white/5 p-2 text-white/60 backdrop-blur-sm transition-colors hover:bg-white/10 hover:text-white"
              aria-label={hidden ? "Show balance" : "Hide balance"}
            >
              {hidden ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          )}
        </div>

        {kycLocked ? (
          <div className="mt-3">
            <div className="flex items-center gap-2.5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-red-500/20 bg-red-500/10">
                <Lock className="h-5 w-5 text-red-400" />
              </div>
              <div>
                <p className="font-serif text-2xl font-bold tracking-tight text-white md:text-3xl">
                  ****.**
                </p>
                <p className="text-xs font-medium text-red-400">
                  Complete KYC to view balance
                </p>
              </div>
            </div>
          </div>
        ) : (
          <>
            <p className="mt-3 font-serif text-4xl font-bold tracking-tight text-white md:text-5xl">
              {hidden ? "********" : formatCurrency(displayBalance)}
            </p>

            <div className="mt-2 flex items-center gap-3">
              <span className="text-sm text-white/60">
                {displayCurrency} Wallet
              </span>
              <span className="flex items-center gap-1 rounded-full bg-[#1FCB71] px-3 py-1 text-xs font-semibold text-white shadow-[0_0_15px_rgba(31,203,113,0.4)]">
                <TrendingUp className="h-3 w-3" />
                Active
              </span>
            </div>
          </>
        )}

        {!kycLocked ? (
          <div className="mt-6 grid grid-cols-2 gap-4">
            <div className="flex items-center gap-3 rounded-2xl border border-[#3b82f6]/40 bg-[#3b82f6]/10 p-3.5 shadow-[inset_0_0_20px_rgba(59,130,246,0.05)] backdrop-blur-md">
              <div className="flex h-10 w-10 items-center justify-center rounded-full border border-[#3b82f6] bg-transparent">
                <ArrowDownLeft className="h-5 w-5 text-[#3b82f6]" />
              </div>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-widest text-white/60">
                  Income
                </p>
                <p className="font-serif text-base font-bold text-white">
                  {formatCurrency(totalIncome)}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-2xl border border-[#ef4444]/40 bg-[#ef4444]/10 p-3.5 shadow-[inset_0_0_20px_rgba(239,68,68,0.05)] backdrop-blur-md">
              <div className="flex h-10 w-10 items-center justify-center rounded-full border border-[#ef4444] bg-transparent">
                <ArrowUpRight className="h-5 w-5 text-[#ef4444]" />
              </div>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-widest text-white/60">
                  Expense
                </p>
                <p className="font-serif text-base font-bold text-white">
                  {formatCurrency(totalExpenses)}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="mt-6 grid grid-cols-2 gap-4">
            <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-3.5 backdrop-blur-md">
              <div className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-transparent">
                <ArrowDownLeft className="h-5 w-5 text-white/40" />
              </div>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-widest text-white/60">
                  Income
                </p>
                <p className="font-serif text-base font-bold text-white/40">
                  --
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-3.5 backdrop-blur-md">
              <div className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-transparent">
                <ArrowUpRight className="h-5 w-5 text-white/40" />
              </div>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-widest text-white/60">
                  Expense
                </p>
                <p className="font-serif text-base font-bold text-white/40">
                  --
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
