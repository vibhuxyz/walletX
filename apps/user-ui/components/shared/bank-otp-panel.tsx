"use client";

/**
 * BankOtpPanel — reusable bank-branded OTP verification UI.
 *
 * Previously duplicated between:
 *   - app/dashboard/top-up.tsx   (step 2)
 *   - app/bank-otp/page.tsx
 */

import { Clock, Landmark, RefreshCw, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";

interface TransactionMeta {
  bankName: string;
  maskedAccount: string;
  merchantName?: string;
  amount: string;
  /** Extra rows to display (label → value pairs) */
  extraRows?: { label: string; value: string }[];
}

interface BankOtpPanelProps {
  meta: TransactionMeta;
  otp: string;
  onOtpChange: (value: string) => void;
  onConfirm: () => void;
  onCancel: () => void;
  onResend: () => void;
  countdown: number;
  canResend: boolean;
  isLoading?: boolean;
  isResending?: boolean;
  confirmLabel?: string;
  cancelLabel?: string;
}

export function BankOtpPanel({
  meta,
  otp,
  onOtpChange,
  onConfirm,
  onCancel,
  onResend,
  countdown,
  canResend,
  isLoading = false,
  isResending = false,
  confirmLabel = "CONFIRM",
  cancelLabel = "CANCEL",
}: BankOtpPanelProps) {
  const minutes = Math.floor(countdown / 60);
  const seconds = countdown % 60;

  return (
    <div>
      {/* Bank header */}
      <div className="rounded-t-2xl bg-primary px-6 py-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-foreground/15">
              <Landmark className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <p className="text-sm font-bold text-primary-foreground capitalize">
                {meta.bankName}
              </p>
              <p className="text-[10px] text-primary-foreground/60">
                Secure Payment Gateway
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 rounded-full bg-primary-foreground/10 px-3 py-1">
            <Shield className="h-3.5 w-3.5 text-primary-foreground/70" />
            <span className="text-[10px] font-medium text-primary-foreground/70">
              SSL Secured
            </span>
          </div>
        </div>
      </div>

      {/* Transaction details */}
      <div className="border-x border-border/30 bg-card px-6 py-5">
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Account</span>
            <span className="font-mono font-semibold text-foreground">
              {meta.maskedAccount}
            </span>
          </div>
          {meta.merchantName && (
            <>
              <div className="h-px bg-border/30" />
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Merchant</span>
                <span className="font-semibold text-foreground">
                  {meta.merchantName}
                </span>
              </div>
            </>
          )}
          {meta.extraRows?.map((row) => (
            <div key={row.label}>
              <div className="h-px bg-border/30" />
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{row.label}</span>
                <span className="font-semibold text-foreground">{row.value}</span>
              </div>
            </div>
          ))}
          <div className="h-px bg-border/30" />
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Amount</span>
            <span className="text-lg font-bold text-primary">{meta.amount}</span>
          </div>
        </div>
      </div>

      {/* OTP input section */}
      <div className="border-x border-t border-border/30 bg-muted/30 px-6 py-6">
        <div className="text-center">
          <h3 className="text-lg font-bold text-foreground">OTP Authentication</h3>
          <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
            An OTP has been sent to your registered bank email. Enter it below
            to authorise this transaction.
          </p>
        </div>

        <div className="mt-5">
          <label
            htmlFor="bank-otp-input"
            className="text-xs font-semibold uppercase tracking-widest text-muted-foreground"
          >
            Enter OTP
          </label>
          <Input
            id="bank-otp-input"
            type="text"
            inputMode="numeric"
            maxLength={6}
            placeholder="Enter 6-digit OTP"
            value={otp}
            onChange={(e) =>
              onOtpChange(e.target.value.replace(/\D/g, "").slice(0, 6))
            }
            className="mt-2 h-12 bg-card border-border/50 text-center text-xl font-mono font-bold tracking-[0.5em] placeholder:text-sm placeholder:tracking-normal placeholder:font-normal"
          />
        </div>

        {/* Countdown + resend */}
        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Clock className="h-3.5 w-3.5" />
            {countdown > 0 ? (
              <span>
                Auto-timeout in{" "}
                <span className="font-semibold text-foreground">
                  {minutes}:{seconds.toString().padStart(2, "0")}
                </span>
              </span>
            ) : (
              <span className="text-destructive">OTP expired</span>
            )}
          </div>
          <button
            type="button"
            onClick={onResend}
            disabled={!canResend || isResending}
            className={`flex items-center gap-1 text-xs font-semibold ${
              canResend && !isResending
                ? "text-primary hover:underline cursor-pointer"
                : "text-muted-foreground/50 cursor-not-allowed"
            }`}
          >
            {isResending ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              <RefreshCw className="h-3 w-3" />
            )}
            RESEND
          </button>
        </div>

        {/* Action buttons */}
        <div className="mt-5 flex gap-3">
          <Button
            onClick={onConfirm}
            disabled={otp.length < 6 || isLoading || countdown <= 0}
            className="flex-1 h-11 bg-primary text-primary-foreground hover:bg-primary/90 font-semibold"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Verifying...
              </>
            ) : (
              confirmLabel
            )}
          </Button>
          <Button
            variant="outline"
            onClick={onCancel}
            disabled={isLoading}
            className="flex-1 h-11 border-border/50 font-semibold"
          >
            {cancelLabel}
          </Button>
        </div>
      </div>

      {/* Footer */}
      <div className="rounded-b-2xl border border-t-0 border-border/30 bg-card px-6 py-4">
        <p className="text-center text-[10px] leading-relaxed text-muted-foreground">
          OTPs are SECRET. DO NOT disclose it to anyone. Your bank NEVER asks
          for OTP.
        </p>
      </div>
    </div>
  );
}
