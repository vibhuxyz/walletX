"use client";

import { useState, useCallback, useEffect, memo, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle2,
  ChevronDown,
  Wallet,
  Sparkles,
  Lock,
  Loader2,
  AlertCircle,
  MoreHorizontal,
  ArrowDownToLine,
  XCircle,
  Clock,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatCurrency } from "@/lib/constants";
import { StepIndicator } from "@/components/shared/step-indicator";
import { KycGate } from "@/components/shared/kyc-gate";
import { PinInput } from "@/components/shared/otp-inputs";
import { BankOtpPanel } from "@/components/shared/bank-otp-panel";
import { useOtpCountdown } from "@/lib/utils/use-otp-countdown";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchLinkedAccounts, type BankAccount } from "@/lib/api/bankApi";
import {
  initiateTopup,
  verifyTopupPin,
  confirmTopup,
  type InitiateTopupResponse,
} from "@/lib/api/topupApi";
import { useWalletBalance } from "@/lib/wallet/useWalletQuery";
import { getLedgerEntries, type LedgerEntry } from "@/lib/api/ledgerApi";

const STEPS = ["Amount", "Wallet PIN", "Bank OTP", "Success"];
const QUICK_AMOUNTS = [50, 100, 250, 500, 1000];
const OTP_DURATION = 120;

//  BankSelector 

const BankSelector = memo(function BankSelector({
  accounts,
  selected,
  onSelect,
}: {
  accounts: BankAccount[];
  selected: BankAccount;
  onSelect: (a: BankAccount) => void;
}) {
  return (
    <div className="flex flex-col gap-2">
      <Label className="text-xs font-bold uppercase tracking-widest text-[#5d7079] ml-1">
        From Bank Account
      </Label>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            className="w-full justify-between border-gray-200 bg-gray-50 hover:!bg-gray-100 !text-[#373d48] hover:!text-[#373d48] h-16 px-5 shadow-sm transition-all focus:ring-2 focus:ring-[#25d366]/50"
          >
            <span className="flex items-center gap-4">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#e2f3e8] text-[11px] font-bold text-[#25d366] uppercase">
                {selected.bankName.slice(0, 2)}
              </span>
              <span className="text-left flex flex-col justify-center">
                <span className="text-[15px] font-bold capitalize leading-tight text-[#373d48] mb-0.5">
                  {selected.bankName}
                </span>
                <span className="text-[13px] font-medium text-[#5d7079] leading-tight">
                  {selected.accountNumber} · {selected.accountType}
                </span>
              </span>
            </span>
            <ChevronDown className="h-5 w-5 text-[#5d7079]" />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent
          align="start"
          className="w-[var(--radix-dropdown-menu-trigger-width)] rounded-2xl p-2 border border-gray-100 shadow-xl bg-white animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2"
        >
          {accounts.map((bank) => (
            <DropdownMenuItem
              key={bank.linkId}
              onClick={() => onSelect(bank)}
              className="flex items-center gap-4 p-3 cursor-pointer rounded-xl focus:bg-gray-50 focus:!text-[#373d48] outline-none transition-colors"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#e2f3e8] text-[11px] font-bold text-[#25d366] uppercase">
                {bank.bankName.slice(0, 2)}
              </span>
              <div className="flex flex-col">
                <span className="block text-[15px] font-bold capitalize text-[#373d48]">
                  {bank.bankName}
                </span>
                <span className="block text-[13px] font-medium text-[#5d7079] mt-0.5">
                  {bank.accountNumber} · {bank.accountType}
                </span>
              </div>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
});

// TopUpContent

function TopUpContent() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: balanceData } = useWalletBalance();
  const balance = parseFloat(balanceData?.availableBalance ?? "0");

  const [step, setStep] = useState(0);
  const [amount, setAmount] = useState("");
  const [pin, setPin] = useState("");
  const [otp, setOtp] = useState("");
  const [selectedBank, setSelectedBank] = useState<BankAccount | null>(null);
  const orderRef = useRef<InitiateTopupResponse | null>(null);

  const {
    countdown,
    canResend,
    start: startCountdown,
  } = useOtpCountdown({ initialSeconds: OTP_DURATION, autoStart: false });

  // Fetch Linked Accounts 
  const {
    data: accountsData,
    isLoading: accountsLoading,
    isError: accountsError,
  } = useQuery({
    queryKey: ["bank", "accounts"],
    queryFn: fetchLinkedAccounts,
    staleTime: 1000 * 60 * 5,
  });
  const accounts = accountsData?.accounts ?? [];

  // Fetch Recent Topup Transactions 
  const { data: topupData, isLoading: topupsLoading } = useQuery({
    queryKey: ["ledger", "topup", 10],
    queryFn: () =>
      getLedgerEntries({
        category: "topup",
        limit: 10,
        offset: 0,
      }),
    staleTime: 1000 * 30,
  });

  const recentTopups = topupData?.entries ?? [];

  //  Calculate Monthly Total ONLY SUCCESS transactions
  const { monthlyTotal, monthlyCount } = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const successTransactions = recentTopups.filter((entry) => {
      const entryDate = new Date(entry.createdAt);
      return (
        entryDate.getMonth() === currentMonth &&
        entryDate.getFullYear() === currentYear &&
        entry.status === "SUCCESS" //  ONLY count SUCCESS
      );
    });

    const total = successTransactions.reduce(
      (sum, entry) => sum + parseFloat(entry.amount),
      0,
    );

    return {
      monthlyTotal: total,
      monthlyCount: successTransactions.length,
    };
  }, [recentTopups]);

  useEffect(() => {
    if (accounts.length > 0 && !selectedBank) {
      setSelectedBank(accounts.find((a) => a.isDefault) ?? accounts[0]);
    }
  }, [accounts, selectedBank]);

  const initiateMutation = useMutation({
    mutationFn: initiateTopup,
    onSuccess: (data) => {
      orderRef.current = data;
      setStep(1);
    },
    onError: (err: any) =>
      toast.error(err?.response?.data?.message ?? "Failed to initiate top up"),
  });

  const verifyPinMutation = useMutation({
    mutationFn: verifyTopupPin,
    onSuccess: (data) => {
      toast.info(`OTP sent to ${data.emailHint}`);
      setStep(2);
      startCountdown();
    },
    onError: (err: any) =>
      toast.error(err?.response?.data?.message ?? "Invalid PIN"),
  });

  const confirmMutation = useMutation({
    mutationFn: confirmTopup,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["wallet", "balance"] });
      queryClient.invalidateQueries({ queryKey: ["wallet", "transactions"] });
      queryClient.invalidateQueries({ queryKey: ["ledger"] });
      toast.success(
        `${formatCurrency(parseFloat(data.amount))} is being processed!`,
      );
      setStep(3);
    },
    onError: (err: any) =>
      toast.error(err?.response?.data?.message ?? "OTP verification failed"),
  });

  const handleContinueToPin = useCallback(() => {
    if (!amount || parseFloat(amount) <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }
    if (!selectedBank) {
      toast.error("Please select a bank account");
      return;
    }
    initiateMutation.mutate({ linkedAccountId: selectedBank.linkId, amount });
  }, [amount, selectedBank, initiateMutation]);

  const handleVerifyPin = useCallback(() => {
    if (pin.length !== 4 || !orderRef.current) return;
    verifyPinMutation.mutate({ orderId: orderRef.current.orderId, pin });
  }, [pin, verifyPinMutation]);

  const handleResendOtp = useCallback(() => {
    if (!orderRef.current || !pin) return;
    verifyPinMutation.mutate(
      { orderId: orderRef.current.orderId, pin },
      {
        onSuccess: (data) => {
          toast.info(`OTP resent to ${data.emailHint}`);
          setOtp("");
          startCountdown();
        },
      },
    );
  }, [pin, verifyPinMutation, startCountdown]);

  const order = orderRef.current;
  const parsedAmount = parseFloat(amount || order?.amount || "0");

  if (accountsLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#25d366]" />
      </div>
    );
  }

  if (accountsError || accounts.length === 0) {
    return (
      <div className="mx-auto max-w-lg mt-10">
        <h1 className="text-[28px] font-extrabold text-[#373d48] mb-1">
          Top Up Wallet
        </h1>
        <p className="text-[#5d7079] mb-6">
          Add funds from your linked bank account
        </p>
        <Card className="border-gray-200 shadow-sm rounded-2xl">
          <CardContent className="flex flex-col items-center gap-4 py-16 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-50">
              <AlertCircle className="h-8 w-8 text-red-500" />
            </div>
            <div>
              <p className="text-xl font-bold text-[#373d48]">
                No Bank Accounts Linked
              </p>
              <p className="mt-2 text-sm text-[#5d7079]">
                Please link a bank account to top up your wallet.
              </p>
            </div>
            <Button
              onClick={() => router.push("/dashboard")}
              className="mt-4 bg-[#25d366] hover:bg-[#20bd5b] text-white px-8 py-6 font-bold"
            >
              Go to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!selectedBank) return null;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 w-full max-w-[1440px] mx-auto pt-4">
      {/* ──  Main Top Up Flow ── */}
      <div className="lg:col-span-8">
        <div className="mb-6">
          <h1 className="text-[28px] font-extrabold text-[#373d48]">
            Top Up Wallet
          </h1>
          <p className="text-sm text-[#5d7079] mt-1">
            Add funds from your linked bank account
          </p>
        </div>

        <div className="mb-8 pl-1 max-w-3xl">
          <StepIndicator steps={STEPS} currentStep={step} />
        </div>

        <AnimatePresence mode="wait">
          {step === 0 && (
            <motion.div
              key="step0"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <Card className="border-gray-200 shadow-sm rounded-3xl overflow-hidden max-w-3xl">
                <CardHeader className="bg-gray-50/50 border-b border-gray-100 pb-4 pt-5 px-6">
                  <CardTitle className="flex items-center gap-2 text-[15px] font-bold text-[#373d48]">
                    <ArrowDownToLine className="h-4 w-4 text-[#25d366]" />
                    Add Funds
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col gap-6 p-6">
                  <div className="rounded-2xl bg-[#25d366] p-6 text-white shadow-sm relative overflow-hidden">
                    <div className="absolute right-0 top-0 h-full w-1/2 bg-gradient-to-l from-black/10 to-transparent mix-blend-overlay" />
                    <div className="relative z-10 flex items-center gap-2 opacity-90 mb-1">
                      <Wallet className="h-4 w-4" />
                      <span className="text-sm font-semibold uppercase tracking-wider">
                        Current Wallet Balance
                      </span>
                    </div>
                    <div className="relative z-10 text-3xl font-extrabold tracking-tight mt-1">
                      {formatCurrency(balance)}
                    </div>
                    <div className="relative z-10 text-xs opacity-80 mt-1">
                      Primary (INR)
                    </div>
                  </div>

                  <BankSelector
                    accounts={accounts}
                    selected={selectedBank}
                    onSelect={setSelectedBank}
                  />

                  <div className="flex flex-col gap-2">
                    <Label className="text-xs font-bold uppercase tracking-widest text-[#5d7079] ml-1">
                      Amount
                    </Label>
                    <div className="relative">
                      <span className="absolute left-5 top-1/2 -translate-y-1/2 text-[22px] font-bold text-[#373d48]">
                        ₹
                      </span>
                      <Input
                        type="number"
                        placeholder="0.00"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className="pl-12 text-[22px] font-bold bg-gray-50 border-gray-200 h-16 rounded-xl text-[#373d48] placeholder:text-gray-300 focus-visible:ring-[#25d366]"
                        min="1"
                        step="0.01"
                      />
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {QUICK_AMOUNTS.map((qa) => (
                      <Button
                        key={qa}
                        type="button"
                        variant="outline"
                        onClick={() => setAmount(qa.toString())}
                        className={`font-bold border-gray-200 h-10 px-4 transition-all ${
                          amount === qa.toString()
                            ? "border-[#25d366] !bg-[#e2f3e8] !text-[#1b4b36] hover:!bg-[#e2f3e8] hover:!text-[#1b4b36]"
                            : "bg-gray-50 !text-[#5d7079] hover:!bg-gray-200 hover:!text-[#373d48]"
                        }`}
                      >
                        ₹{qa}
                      </Button>
                    ))}
                  </div>

                  <Button
                    onClick={handleContinueToPin}
                    disabled={
                      !amount ||
                      parseFloat(amount) <= 0 ||
                      initiateMutation.isPending
                    }
                    className="w-full bg-[#25d366] text-white hover:bg-[#20bd5b] font-bold h-14 text-base mt-2 transition-colors"
                  >
                    {initiateMutation.isPending ? (
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    ) : (
                      "Continue"
                    )}
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Step 1 PIN */}
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="border-gray-200 shadow-sm rounded-3xl max-w-3xl">
                <CardHeader className="text-center pb-3 pt-8">
                  <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#e2f3e8]">
                    <Lock className="h-7 w-7 text-[#25d366]" />
                  </div>
                  <CardTitle className="text-xl font-bold text-[#373d48]">
                    Enter Wallet PIN
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col gap-6 p-6">
                  <div className="rounded-2xl bg-gray-50 p-6 text-center border border-gray-100">
                    <p className="text-xs font-bold uppercase tracking-widest text-[#5d7079]">
                      Amount to add
                    </p>
                    <p className="mt-2 text-[32px] font-extrabold text-[#373d48] tracking-tight">
                      {formatCurrency(parsedAmount)}
                    </p>
                    <p className="mt-1 text-sm text-[#5d7079] capitalize font-medium">
                      From {selectedBank.bankName} ({selectedBank.accountNumber}
                      )
                    </p>
                  </div>

                  <div className="flex flex-col items-center gap-4 py-4">
                    <Label className="text-sm font-bold text-[#5d7079]">
                      Enter your 4-digit wallet PIN
                    </Label>
                    <PinInput value={pin} onChange={setPin} />
                  </div>

                  <div className="flex gap-4">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setStep(0);
                        setPin("");
                      }}
                      disabled={verifyPinMutation.isPending}
                      className="flex-1 h-14 font-bold border-gray-200 !text-[#373d48] hover:!bg-gray-100 hover:!text-[#373d48]"
                    >
                      Back
                    </Button>
                    <Button
                      onClick={handleVerifyPin}
                      disabled={pin.length !== 4 || verifyPinMutation.isPending}
                      className="flex-1 h-14 bg-[#25d366] text-white hover:bg-[#20bd5b] font-bold"
                    >
                      {verifyPinMutation.isPending ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                      ) : (
                        "Verify PIN"
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Step 2 Bank OTP */}
          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
              className="max-w-3xl"
            >
              <BankOtpPanel
                meta={{
                  bankName: order?.account.bankName ?? selectedBank.bankName,
                  maskedAccount:
                    order?.account.maskedAccount ?? selectedBank.accountNumber,
                  merchantName: "FineWallet",
                  amount: formatCurrency(parsedAmount),
                }}
                otp={otp}
                onOtpChange={setOtp}
                onConfirm={() => {
                  if (otp.length !== 6 || !orderRef.current) return;
                  confirmMutation.mutate({
                    orderId: orderRef.current.orderId,
                    otp,
                  });
                }}
                onCancel={() => {
                  setStep(1);
                  setOtp("");
                }}
                onResend={handleResendOtp}
                countdown={countdown}
                canResend={canResend}
                isLoading={confirmMutation.isPending}
                isResending={verifyPinMutation.isPending}
              />
            </motion.div>
          )}

          {/* Step 3 Success */}
          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
            >
              <Card className="border-gray-200 shadow-sm rounded-3xl text-center max-w-3xl">
                <CardContent className="flex flex-col items-center gap-6 p-10">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
                    className="flex h-20 w-20 items-center justify-center rounded-full bg-[#e2f3e8]"
                  >
                    <CheckCircle2 className="h-10 w-10 text-[#25d366]" />
                  </motion.div>

                  <div>
                    <h2 className="text-[28px] font-extrabold text-[#373d48]">
                      Top Up Initiated!
                    </h2>
                    <p className="text-base text-[#5d7079] mt-2">
                      {formatCurrency(parsedAmount)} is being processed from{" "}
                      <span className="capitalize font-bold text-[#373d48]">
                        {order?.account.bankName ?? selectedBank.bankName}
                      </span>{" "}
                      (
                      {order?.account.maskedAccount ??
                        selectedBank.accountNumber}
                      ).
                    </p>
                  </div>

                  <div className="w-full rounded-2xl bg-[#f8fcf9] border border-[#e2f3e8] p-6 mt-2">
                    <div className="flex items-center justify-center gap-2 text-[#25d366]">
                      <Sparkles className="h-5 w-5" />
                      <p className="text-xs font-bold uppercase tracking-widest">
                        Updated Wallet Balance
                      </p>
                    </div>
                    <p className="mt-3 text-[32px] font-extrabold text-[#1b4b36]">
                      {formatCurrency(balance)}
                    </p>
                  </div>

                  <Button
                    onClick={() => router.push("/dashboard")}
                    className="mt-4 w-full bg-[#25d366] text-white hover:bg-[#20bd5b] font-bold h-14 text-base"
                  >
                    Back to Dashboard
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── RIGHT COLUMN: Insights & Recent Transactions ── */}
      <div className="lg:col-span-4 space-y-6">
        {/* Insights Card */}
        <Card className="border-gray-100 shadow-sm rounded-3xl">
          <CardHeader className="pb-2 pt-6 px-6 flex flex-row items-center justify-between">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-[#373d48]">
              Transaction Insights
            </CardTitle>
            <MoreHorizontal className="h-5 w-5 text-gray-400 cursor-pointer" />
          </CardHeader>
          <CardContent className="px-6 pb-6">
            {topupsLoading ? (
              <div className="space-y-3">
                <div className="h-4 bg-gray-100 rounded animate-pulse" />
                <div className="h-2.5 bg-gray-100 rounded animate-pulse" />
              </div>
            ) : (
              <>
                <p className="text-sm font-medium text-[#5d7079] mb-3">
                  Total Top-ups (This Month):{" "}
                  <span className="font-bold text-[#373d48]">
                    ₹
                    {monthlyTotal.toLocaleString("en-IN", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </span>
                </p>
                <div className="h-2.5 w-full bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#25d366] rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.min((monthlyTotal / 10000) * 100, 100)}%`,
                    }}
                  />
                </div>
                <p className="text-xs text-[#5d7079] mt-2">
                  {monthlyCount} successful transaction
                  {monthlyCount !== 1 ? "s" : ""} this month
                </p>
              </>
            )}
          </CardContent>
        </Card>

        {/* Recent Top Up Transactions with proper status display */}
        <Card className="border-gray-100 shadow-sm rounded-3xl overflow-hidden flex flex-col h-[540px]">
          <CardHeader className="bg-gray-50 border-b border-gray-100 py-5 px-6">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-[#373d48]">
              Recent Top Up Transactions
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 flex-1 overflow-y-auto">
            {topupsLoading ? (
              <div className="flex flex-col">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-5 border-b border-gray-50"
                  >
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 bg-gray-100 rounded-xl animate-pulse" />
                      <div className="space-y-2">
                        <div className="h-4 w-32 bg-gray-100 rounded animate-pulse" />
                        <div className="h-3 w-24 bg-gray-100 rounded animate-pulse" />
                      </div>
                    </div>
                    <div className="h-4 w-20 bg-gray-100 rounded animate-pulse" />
                  </div>
                ))}
              </div>
            ) : recentTopups.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                <Wallet className="h-12 w-12 text-gray-300 mb-3" />
                <p className="text-sm font-semibold text-[#373d48]">
                  No top-ups yet
                </p>
                <p className="text-xs text-[#5d7079] mt-1">
                  Your recent top-up transactions will appear here
                </p>
              </div>
            ) : (
              <div className="flex flex-col">
                {recentTopups.map((tx, i) => {
                  //  Status-based styling
                  const StatusIcon =
                    tx.status === "SUCCESS"
                      ? CheckCircle2
                      : tx.status === "FAILED"
                        ? XCircle
                        : Clock;

                  const statusColor =
                    tx.status === "SUCCESS"
                      ? "text-[#25d366]"
                      : tx.status === "FAILED"
                        ? "text-red-600"
                        : "text-yellow-600";

                  // Avatar background based on status
                  const avatarBg =
                    tx.status === "SUCCESS"
                      ? "bg-[#e2f3e8] text-[#25d366]"
                      : tx.status === "FAILED"
                        ? "bg-red-50 text-red-600"
                        : "bg-yellow-50 text-yellow-600";

                  // Amount color based on status
                  const amountColor =
                    tx.status === "SUCCESS"
                      ? "text-[#25d366]"
                      : tx.status === "FAILED"
                        ? "text-red-600"
                        : "text-[#373d48]";

                  const time = new Date(tx.createdAt).toLocaleTimeString(
                    "en-IN",
                    {
                      hour: "numeric",
                      minute: "2-digit",
                      hour12: true,
                    },
                  );

                  return (
                    <div
                      key={tx.transactionId}
                      className={`flex items-center justify-between p-5 ${i !== recentTopups.length - 1 ? "border-b border-gray-50" : ""}`}
                    >
                      <div className="flex items-center gap-4">
                        {/*  Avatar changes color based on status */}
                        <div
                          className={`flex h-10 w-10 items-center justify-center rounded-xl font-bold text-xs ${avatarBg}`}
                        >
                          {tx.bankDetails?.bankName.slice(0, 2).toUpperCase() ||
                            "BK"}
                        </div>
                        <div>
                          <p className="text-[14px] font-bold text-[#373d48]">
                            {tx.title}
                          </p>
                          <p className="text-[12px] text-[#5d7079] mt-0.5">
                            {tx.bankDetails?.accountNumber || tx.subtitle}
                          </p>

                          {/*  Show failure reason */}
                          {tx.status === "FAILED" && tx.note && (
                            <p className="text-[11px] text-red-600 mt-1 italic">
                              {tx.note}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        {/*  Only show + for SUCCESS */}
                        <p className={`text-[14px] font-bold ${amountColor}`}>
                          {tx.status === "SUCCESS" ? "+" : ""}₹{tx.amount}
                        </p>
                        <div className="flex items-center justify-end gap-1 mt-1">
                          <StatusIcon className={`h-3 w-3 ${statusColor}`} />
                          <p className={`text-[11px] font-bold ${statusColor}`}>
                            {tx.status === "SUCCESS"
                              ? "Completed"
                              : tx.status === "FAILED"
                                ? "Failed"
                                : "Pending"}
                          </p>
                        </div>
                        <p className="text-[10px] text-[#5d7079] mt-0.5">
                          {time}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
          {recentTopups.length > 0 && (
            <div
              onClick={() => router.push("/dashboard/transactions")}
              className="border-t border-gray-100 p-4 text-center bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors"
            >
              <span className="text-sm font-bold text-[#373d48]">
                See All Top Ups
              </span>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

export default function TopUpPage() {
  return (
    <KycGate featureName="Top Up Wallet">
      <TopUpContent />
    </KycGate>
  );
}
