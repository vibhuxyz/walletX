"use client";

import { useRouter } from "next/navigation";
import { useState, useCallback, useRef, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { useQuery, useMutation } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { KycGate } from "@/components/shared/kyc-gate";
import {
  Landmark,
  Lock,
  Smartphone,
  CheckCircle2,
  Loader2,
  Shield,
  ArrowLeft,
  LockKeyhole,
  KeyRound,
  ShieldCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  fetchBanks,
  initiateBankLink,
  verifyBankLinkPin,
  confirmBankLink,
  type LinkInitiateResponse,
  type LinkConfirmResponse,
} from "@/lib/api/bankApi";
import { getApiError } from "@/lib/api/transfer";

// ── Step Metadata ─────────────────────────────────────────────────────────────
const STEPS_META = [
  {
    label: "Verify Bank Details",
    desc: "Enter your bank account information.",
    icon: Landmark,
    title: "Verify Your Bank Details",
    subtitle: "Enter your bank account information.",
  },
  {
    label: "Verify PIN",
    desc: "Confirm your bank's transaction PIN.",
    icon: KeyRound,
    title: "Verify Your PIN",
    subtitle: "Enter your 4-digit wallet PIN to continue.",
  },
  {
    label: "Bank OTP",
    desc: "Provide the One-Time Password.",
    icon: ShieldCheck,
    title: "Bank OTP Verification",
    subtitle: "Enter the OTP sent to your registered email.",
  },
  {
    label: "Done",
    desc: "Your account is linked.",
    icon: CheckCircle2,
    title: "Bank Account Added!",
    subtitle: "Your bank account has been successfully linked.",
  },
];

// ── Types ─────────────────────────────────────────────────────────────────────
interface BankFormValues {
  bankName: string;
  accountNumber: string;
  ifscCode: string;
  accountHolder: string;
  accountType: "SAVINGS" | "CURRENT";
}

// ── Main Content Component ────────────────────────────────────────────────────
function AddBankAccountContent() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [pin, setPin] = useState("");
  const [otp, setOtp] = useState("");
  const [emailHint, setEmailHint] = useState("");
  const [confirmResult, setConfirmResult] =
    useState<LinkConfirmResponse | null>(null);

  // Persist linkToken across steps without causing re-renders
  const linkTokenRef = useRef<string>("");

  // Form setup
  const form = useForm<BankFormValues>({
    defaultValues: {
      bankName: "",
      accountNumber: "",
      ifscCode: "",
      accountHolder: "",
      accountType: "SAVINGS",
    },
  });

  const {
    register,
    setValue,
    watch,
    formState: { errors },
  } = form;
  const bankName = watch("bankName");
  const accountType = watch("accountType");

  // Fetch Banks (near real-time refresh)
  const {
    data: banksData,
    isLoading: banksLoading,
    refetch: refetchBanks,
    isFetching: isFetchingBanks,
  } = useQuery({
    queryKey: ["bank", "list"],
    queryFn: fetchBanks,
    staleTime: 1000 * 5,
    refetchInterval: 1000 * 5,
    refetchOnWindowFocus: true,
  });
  const banks = banksData?.banks ?? [];

  // Mutations
  const initiateMutation = useMutation({
    mutationFn: (values: BankFormValues) =>
      initiateBankLink({
        bankName: values.bankName,
        accountNumber: values.accountNumber,
        ifscCode: values.ifscCode,
        accountHolder: values.accountHolder,
        accountType: values.accountType,
      }),
    onSuccess: (data: LinkInitiateResponse) => {
      linkTokenRef.current = data.linkToken;
      toast.success(
        data.message || "Bank details accepted. Please verify your PIN.",
      );
      setStep(1);
    },
    onError: (err) => {
      toast.error(getApiError(err));
    },
  });

  const pinMutation = useMutation({
    mutationFn: () => verifyBankLinkPin(linkTokenRef.current, pin),
    onSuccess: (data) => {
      linkTokenRef.current = data.linkToken;
      setEmailHint(data.emailHint ?? "");
      toast.success(data.message || "PIN verified. OTP sent to your email.");
      setStep(2);
    },
    onError: (err) => {
      toast.error(getApiError(err));
    },
  });

  const confirmMutation = useMutation({
    mutationFn: () => confirmBankLink(linkTokenRef.current, otp),
    onSuccess: (data) => {
      setConfirmResult(data);
      toast.success(data.message || "Bank account linked successfully!");
      setStep(3);
    },
    onError: (err) => {
      toast.error(getApiError(err));
    },
  });

  // Handlers
  const handleNext = useCallback(() => {
    if (step === 0) {
      form.handleSubmit((values) => {
        if (
          !values.bankName ||
          !values.accountNumber ||
          !values.ifscCode ||
          !values.accountHolder
        ) {
          toast.error("Please fill in all fields");
          return;
        }
        initiateMutation.mutate(values);
      })();
    } else if (step === 1) {
      if (pin.length < 4) return;
      pinMutation.mutate();
    } else if (step === 2) {
      if (otp.length < 6) return;
      confirmMutation.mutate();
    } else if (step === 3) {
      router.push("/dashboard");
    }
  }, [
    step,
    form,
    initiateMutation,
    pin,
    pinMutation,
    otp,
    confirmMutation,
    router,
  ]);

  const handleBack = useCallback(() => {
    if (step > 0 && step < 3) {
      setStep((prev) => prev - 1);
    } else if (step === 0) {
      router.back();
    }
  }, [step, router]);

  // Force-refresh bank list when user returns to step 0
  useEffect(() => {
    if (step === 0) {
      void refetchBanks();
    }
  }, [step, refetchBanks]);

  const handleResendOtp = useCallback(() => {
    if (!pin) return;
    pinMutation.mutate();
  }, [pin, pinMutation]);

  const isPending =
    initiateMutation.isPending ||
    pinMutation.isPending ||
    confirmMutation.isPending;
  const total = STEPS_META.length;
  const segments = Array.from({ length: total }, (_, i) => i);

  return (
    <div className="flex w-full max-w-6xl h-[88vh] min-h-[750px] max-h-[900px] flex-col lg:flex-row rounded-[2.5rem] bg-background  overflow-hidden border border-border/60">
      {/* ── Left panel — 35% width ─────────────────────────────── */}
      <div className="hidden lg:flex lg:w-[35%] flex-col bg-background px-8 lg:px-12 py-10 overflow-y-auto no-scrollbar border-r border-border/60">
        {/* Header Row: Back button, step counter + progress */}
        <div className="flex items-center justify-between mb-12">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={handleBack}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-muted/50 text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
              aria-label="Go back"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <p className="text-[14px] font-bold text-foreground tracking-wide">
              {String(step + 1).padStart(2, "0")}
              <span className="text-muted-foreground font-normal ml-1">
                of {String(total).padStart(2, "0")}
              </span>
            </p>
          </div>
          {/* Segmented progress dots */}
          <div className="flex items-center gap-1.5 bg-muted/30 p-1.5 rounded-full">
            {segments.map((i) => (
              <div
                key={i}
                className={cn(
                  "h-1.5 rounded-full transition-all duration-300",
                  i === step
                    ? "w-5 bg-primary"
                    : i < step
                      ? "w-2 bg-primary/40"
                      : "w-2 bg-border",
                )}
              />
            ))}
          </div>
        </div>

        {/* Title Area */}
        <div className="mb-14">
          <h1 className="text-[28px] font-extrabold leading-[1.2] tracking-tight text-foreground text-balance mb-2">
            Add Bank Account
          </h1>
          <p className="text-[15px] text-muted-foreground">
            Link a new bank account to your wallet.
          </p>
        </div>

        {/* Vertical Stepper with Lines */}
        <ol className="flex flex-col">
          {STEPS_META.map((meta, i) => {
            const isDone = i < step;
            const isActive = i === step;
            const Icon = meta.icon;

            return (
              <li key={meta.label} className="relative flex gap-5">
                {/* Icon & Line Column */}
                <div className="flex flex-col items-center">
                  <div
                    className={cn(
                      "flex h-12 w-12 shrink-0 items-center justify-center rounded-full transition-all z-10",
                      isActive
                        ? "bg-primary/10 text-primary border border-primary/20 shadow-sm"
                        : isDone
                          ? "bg-muted text-muted-foreground"
                          : "bg-muted/50 text-muted-foreground/40",
                    )}
                  >
                    <Icon
                      className={cn("h-5 w-5", isActive ? "text-primary" : "")}
                    />
                  </div>
                  {/* Connecting Line */}
                  {i < STEPS_META.length - 1 && (
                    <div
                      className={cn(
                        "w-[2px] h-12 my-2 rounded-full",
                        isDone ? "bg-muted" : "bg-muted/40",
                      )}
                    />
                  )}
                </div>

                {/* Text Column */}
                <div className="pt-2.5 pb-8">
                  <p
                    className={cn(
                      "text-[16px] font-bold leading-none mb-1.5",
                      isActive ? "text-foreground" : "text-foreground/70",
                    )}
                  >
                    {meta.label}
                  </p>
                  <p
                    className={cn(
                      "text-[14px] leading-snug",
                      isActive
                        ? "text-muted-foreground"
                        : "text-muted-foreground/50",
                    )}
                  >
                    {meta.desc}
                  </p>
                </div>
              </li>
            );
          })}
        </ol>
      </div>

      {/* ── Right panel — 65% width ───────────────────────── */}
      <div className="flex flex-1 flex-col bg-[#F8F9FA] dark:bg-muted/10 lg:w-[65%] relative">
        {/* Mobile header (hidden on desktop) */}
        <div className="flex items-center px-6 pt-6 pb-2 lg:hidden">
          <button
            type="button"
            onClick={handleBack}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-muted/50 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div className="ml-4 flex items-center gap-1.5 flex-1 justify-end">
            {segments.map((i) => (
              <div
                key={i}
                className={cn(
                  "h-1.5 rounded-full transition-all",
                  i === step
                    ? "w-5 bg-primary"
                    : i < step
                      ? "w-2 bg-primary/40"
                      : "w-2 bg-border",
                )}
              />
            ))}
          </div>
        </div>

        {/* Scrollable form area */}
        <div className="flex-1 overflow-y-auto px-6 py-4 lg:px-16 lg:py-12 pb-32 lg:pb-32">
          {/* Top Warning Banner (Only show on Bank Details step to save space later, or keep global) */}
          {step === 0 && (
            <div className="mb-8 flex items-start gap-3 rounded-[14px] bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-900/50 p-4">
              <LockKeyhole className="h-5 w-5 text-orange-600 dark:text-orange-500 mt-0.5 shrink-0" />
              <p className="text-[14px] font-medium text-orange-800 dark:text-orange-400 leading-relaxed">
                <span className="font-bold">Important:</span> For test data
                purposes,{" "}
                <button
                  onClick={() => router.push("/private/bank-accounts")}
                  className="underline hover:text-orange-900 dark:hover:text-orange-300"
                >
                  Click ME
                </button>{" "}
                to Create Or View Fake Bank account.
              </p>
            </div>
          )}

          {/* Dynamic Step Header */}
          <div className="mb-8">
            <h2 className="text-[28px] font-extrabold tracking-tight text-foreground mb-1.5">
              {STEPS_META[step].title}
            </h2>
            <p className="text-[15px] text-muted-foreground">
              {step === 2 && emailHint
                ? `An OTP has been sent to ${emailHint}`
                : STEPS_META[step].subtitle}
            </p>
          </div>

          {/* ── STEP 0: Bank Details ─────────────────────────── */}
          {step === 0 && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-500 max-w-xl">
              <div className="flex flex-col gap-5">
                {/* Bank Name */}
                <div className="flex flex-col gap-1.5">
                  <Label className="text-[12px] font-bold text-muted-foreground uppercase tracking-wider">
                    Bank name
                  </Label>
                  <Select
                    value={bankName}
                    onValueChange={(v) =>
                      setValue("bankName", v, { shouldValidate: true })
                    }
                    disabled={
                      banksLoading ||
                      isFetchingBanks ||
                      initiateMutation.isPending
                    }
                    onOpenChange={(open) => {
                      if (open) {
                        void refetchBanks();
                      }
                    }}
                  >
                    <SelectTrigger
                      className={cn(
                        "bg-background h-12 rounded-xl text-[15px] border-border/40 shadow-sm",
                        errors.bankName ? "border-destructive" : "",
                      )}
                    >
                      <SelectValue
                        placeholder={
                          banksLoading || isFetchingBanks
                            ? "Refreshing banks…"
                            : "Select your bank"
                        }
                      />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      {banks.map((bank) => (
                        <SelectItem key={bank} value={bank} className="py-2.5">
                          {bank}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.bankName && (
                    <p className="text-xs text-destructive">
                      {errors.bankName.message}
                    </p>
                  )}
                </div>

                {/* Account Number */}
                <div className="flex flex-col gap-1.5">
                  <Label
                    htmlFor="accountNumber"
                    className="text-[12px] font-bold text-muted-foreground uppercase tracking-wider"
                  >
                    Account number
                  </Label>
                  <Input
                    id="accountNumber"
                    placeholder="Enter your account number"
                    className={cn(
                      "bg-background h-12 rounded-xl text-[15px] border-border/40 shadow-sm",
                      errors.accountNumber ? "border-destructive" : "",
                    )}
                    {...register("accountNumber")}
                  />
                  {errors.accountNumber && (
                    <p className="text-xs text-destructive">
                      {errors.accountNumber.message}
                    </p>
                  )}
                </div>

                {/* IFSC Code */}
                <div className="flex flex-col gap-1.5">
                  <Label
                    htmlFor="ifscCode"
                    className="text-[12px] font-bold text-muted-foreground uppercase tracking-wider"
                  >
                    IFSC code
                  </Label>
                  <Input
                    id="ifscCode"
                    placeholder="e.g. HDFC0001234"
                    className={cn(
                      "bg-background h-12 rounded-xl text-[15px] border-border/40 shadow-sm",
                      errors.ifscCode ? "border-destructive" : "",
                    )}
                    {...register("ifscCode")}
                  />
                  {errors.ifscCode && (
                    <p className="text-xs text-destructive">
                      {errors.ifscCode.message}
                    </p>
                  )}
                </div>

                {/* Account Holder */}
                <div className="flex flex-col gap-1.5">
                  <Label
                    htmlFor="accountHolder"
                    className="text-[12px] font-bold text-muted-foreground uppercase tracking-wider"
                  >
                    Account holder name
                  </Label>
                  <Input
                    id="accountHolder"
                    placeholder="Full name as on bank account"
                    className={cn(
                      "bg-background h-12 rounded-xl text-[15px] border-border/40 shadow-sm",
                      errors.accountHolder ? "border-destructive" : "",
                    )}
                    {...register("accountHolder")}
                  />
                  {errors.accountHolder && (
                    <p className="text-xs text-destructive">
                      {errors.accountHolder.message}
                    </p>
                  )}
                </div>

                {/* Account Type */}
                <div className="flex flex-col gap-2 mt-1">
                  <Label className="text-[12px] font-bold text-muted-foreground uppercase tracking-wider">
                    Account type
                  </Label>
                  <RadioGroup
                    value={accountType}
                    onValueChange={(v) =>
                      setValue("accountType", v as "SAVINGS" | "CURRENT")
                    }
                    className="flex gap-6 mt-1"
                  >
                    <div className="flex items-center gap-2.5">
                      <RadioGroupItem
                        value="SAVINGS"
                        id="savings"
                        className="text-primary border-primary data-[state=checked]:bg-primary"
                      />
                      <Label
                        htmlFor="savings"
                        className="text-[15px] font-medium text-foreground cursor-pointer"
                      >
                        Savings
                      </Label>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <RadioGroupItem
                        value="CURRENT"
                        id="current"
                        className="text-primary border-primary data-[state=checked]:bg-primary"
                      />
                      <Label
                        htmlFor="current"
                        className="text-[15px] font-medium text-foreground cursor-pointer"
                      >
                        Current
                      </Label>
                    </div>
                  </RadioGroup>
                </div>

                {/* Security Info Box */}
                <div className="flex items-center gap-3 rounded-xl bg-muted/40 border border-border/40 p-4 mt-2">
                  <Lock className="h-5 w-5 text-primary shrink-0" />
                  <p className="text-[13px] text-muted-foreground leading-relaxed">
                    Your bank information is encrypted and stored securely. We
                    never share your data with third parties.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* ── STEP 1: PIN Verification ─────────────────────────── */}
          {step === 1 && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-500 max-w-xl py-6">
              <div className="flex flex-col items-start gap-8">
                <InputOTP
                  maxLength={4}
                  value={pin}
                  onChange={setPin}
                  disabled={isPending}
                >
                  <InputOTPGroup className="gap-3">
                    {[0, 1, 2, 3].map((index) => (
                      <InputOTPSlot
                        key={index}
                        index={index}
                        className="w-14 h-16 sm:w-16 sm:h-20 text-2xl font-bold rounded-xl border-border bg-background shadow-sm"
                      />
                    ))}
                  </InputOTPGroup>
                </InputOTP>
                <p className="text-[14px] text-muted-foreground">
                  This confirms your identity for adding a bank account.
                </p>
              </div>
            </div>
          )}

          {/* ── STEP 2: OTP Verification ─────────────────────────── */}
          {step === 2 && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-500 max-w-xl py-6">
              <div className="flex flex-col items-start gap-6">
                <InputOTP
                  maxLength={6}
                  value={otp}
                  onChange={setOtp}
                  disabled={isPending}
                >
                  <InputOTPGroup className="gap-2 sm:gap-3">
                    {[0, 1, 2, 3, 4, 5].map((index) => (
                      <InputOTPSlot
                        key={index}
                        index={index}
                        className="w-10 h-14 sm:w-14 sm:h-16 text-xl font-bold rounded-xl border-border bg-background shadow-sm"
                      />
                    ))}
                  </InputOTPGroup>
                </InputOTP>

                <div className="flex items-center gap-2">
                  <p className="text-[14px] text-muted-foreground">
                    Didn't receive the code?
                  </p>
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={isPending}
                    className="text-[14px] font-bold text-primary hover:underline disabled:opacity-50"
                  >
                    Resend OTP
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ── STEP 3: Done ─────────────────────────────────────── */}
          {step === 3 && confirmResult && (
            <div className="animate-in fade-in zoom-in-95 duration-500 max-w-md pt-4">
              <div className="rounded-[20px] bg-background border border-border shadow-sm p-6 sm:p-8">
                <div className="flex flex-col gap-5">
                  <div className="flex items-center justify-between border-b border-border/50 pb-4">
                    <span className="text-[13px] font-semibold text-muted-foreground uppercase tracking-wider">
                      Bank
                    </span>
                    <span className="text-[16px] font-bold text-foreground capitalize">
                      {confirmResult.account.bankName}
                    </span>
                  </div>
                  <div className="flex items-center justify-between border-b border-border/50 pb-4">
                    <span className="text-[13px] font-semibold text-muted-foreground uppercase tracking-wider">
                      Account
                    </span>
                    <span className="text-[16px] font-bold text-foreground">
                      {confirmResult.account.maskedAccount}
                    </span>
                  </div>
                  <div className="flex items-center justify-between border-b border-border/50 pb-4">
                    <span className="text-[13px] font-semibold text-muted-foreground uppercase tracking-wider">
                      Type
                    </span>
                    <span className="text-[16px] font-bold text-foreground capitalize">
                      {confirmResult.account.accountType}
                    </span>
                  </div>
                  {confirmResult.account.isDefault && (
                    <div className="flex items-center justify-between pt-1">
                      <span className="text-[13px] font-semibold text-muted-foreground uppercase tracking-wider">
                        Status
                      </span>
                      <div className="flex items-center gap-1.5 text-success bg-success/10 px-3 py-1 rounded-full">
                        <CheckCircle2 className="h-4 w-4" />
                        <span className="text-[13px] font-bold">Default</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ── Footer navigation — Sticky to the bottom ── */}
        <div className="absolute bottom-0 left-0 right-0 border-t border-border/60 bg-[#F8F9FA]/90 dark:bg-background/90 backdrop-blur-md px-6 py-5 lg:px-16 flex items-center justify-between z-10">
          {/* Optional Left Footer Text based on Step */}
          {step === 0 ? (
            <div className="hidden sm:flex items-center gap-2">
              <LockKeyhole className="h-4 w-4 text-orange-500" />
              <span className="text-[14px] font-medium text-orange-600 dark:text-orange-500">
                Why we need your bank details?
              </span>
            </div>
          ) : (
            <div /> // empty div to keep space if flex-between is used
          )}

          {/* Right Action Button */}
          <Button
            type="button"
            onClick={handleNext}
            disabled={
              isPending ||
              (step === 1 && pin.length < 4) ||
              (step === 2 && otp.length < 6)
            }
            className="bg-primary hover:bg-primary/90 text-primary-foreground h-12 px-10 rounded-xl font-bold text-[15px] transition-all ml-auto w-full sm:w-auto shadow-md"
          >
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Processing...
              </>
            ) : step === 3 ? (
              "Go to Dashboard"
            ) : (
              "Continue"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

// ── Page Wrapper ──────────────────────────────────────────────────────────────
export default function AddBankAccountPage() {
  return (
    <KycGate featureName="Add Bank Account">
      <AddBankAccountContent />
    </KycGate>
  );
}
