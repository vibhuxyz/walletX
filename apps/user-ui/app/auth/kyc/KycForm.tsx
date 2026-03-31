"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ShieldCheck,
  FileText,
  MapPin,
  Camera,
  PenLine,
  ArrowLeft,
  ChevronRight,
  Lock,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { fetchCurrentUser, qk } from "@/lib/wallet/useWalletQuery";
import { cn } from "@/lib/utils";

// ── KYC sub-step definitions ──────────────────────────────────────────────────
const KYC_STEPS = [
  {
    id: "identity",
    label: "Verify Your Identity",
    description:
      "We'll use your government-issued ID to confirm your financial identity.",
    icon: ShieldCheck,
    formTitle: "Verify Your Identity",
    formSubtitle:
      "Enter your government-issued ID number to confirm your identity.",
    inputLabel: "National ID / Passport Number",
    inputPlaceholder: "e.g. A123456789",
    infoText: "Why we need your ID number?",
    infoDetail:
      "Your ID number is encrypted and used only for regulatory identity verification. We never share it without your consent.",
  },
  {
    id: "document",
    label: "Upload a Valid Government-Issued ID",
    description:
      "Choose from your National ID, Driver's License, Passport, or Voter's Card.",
    icon: FileText,
    formTitle: "Upload a Valid Government-Issued ID",
    formSubtitle: "Upload a clear photo of your government-issued ID document.",
    inputLabel: "Document type / reference number",
    inputPlaceholder: "National ID, Passport, Driver's License…",
    infoText: "Which documents are accepted?",
    infoDetail:
      "We accept National ID cards, international passports, driver's licences, and voter registration cards issued within the last 10 years.",
  },
  {
    id: "address",
    label: "Provide Proof of Address",
    description:
      "Upload a utility bill or enter your current residential address.",
    icon: MapPin,
    formTitle: "Provide Proof of Address",
    formSubtitle:
      "Enter or upload proof of your current residential address.",
    inputLabel: "Residential address",
    inputPlaceholder: "123 Main Street, City, State",
    infoText: "What counts as proof of address?",
    infoDetail:
      "Any government or utility document showing your full name and address dated within the last 3 months — electricity bill, bank statement, or tenancy agreement.",
  },
  {
    id: "selfie",
    label: "Take a Quick Live Selfie",
    description:
      "We'll match your face to your ID to make sure it's really you.",
    icon: Camera,
    formTitle: "Take a Quick Live Selfie",
    formSubtitle:
      "We'll compare your live photo with your submitted ID document.",
    inputLabel: "Selfie verification token",
    inputPlaceholder: "Camera capture token appears here",
    infoText: "How is my selfie used?",
    infoDetail:
      "Your selfie is processed by our biometric engine solely to match against your ID photo. It is deleted immediately after verification.",
  },
  {
    id: "signature",
    label: "Submit Your Signature",
    description:
      "Type it, draw it, or upload a scanned copy for verification.",
    icon: PenLine,
    formTitle: "Submit Your Signature",
    formSubtitle:
      "Provide your signature to complete the verification process.",
    inputLabel: "Signature / reference",
    inputPlaceholder: "Type or paste your signature token",
    infoText: "Why do we need your signature?",
    infoDetail:
      "Your signature is used as an additional layer of identity confirmation and will be stored securely in line with financial regulations.",
  },
] as const;

export default function AuthKycPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [activeStep, setActiveStep] = useState(0);
  const [inputValue, setInputValue] = useState("");
  const [showInfo, setShowInfo] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    queryClient.invalidateQueries({ queryKey: qk.user });
  }, [queryClient]);

  const step = KYC_STEPS[activeStep];
  const isLastStep = activeStep === KYC_STEPS.length - 1;
  const stepNumber = String(activeStep + 1).padStart(2, "0");
  const totalSteps = String(KYC_STEPS.length).padStart(2, "0");

  async function handleContinue() {
    if (!inputValue.trim()) {
      toast.error("Please fill in the required field.");
      return;
    }
    if (isLastStep) {
      setIsLoading(true);
      try {
        toast.success("KYC submitted! We'll notify you once verified.");
        router.push("/private/kyc");
      } catch {
        toast.error("Something went wrong. Please try again.");
        setIsLoading(false);
      }
    } else {
      setInputValue("");
      setShowInfo(false);
      setActiveStep((s) => s + 1);
    }
  }

  function handleBack() {
    if (activeStep > 0) {
      setInputValue("");
      setShowInfo(false);
      setActiveStep((s) => s - 1);
    } else {
      toast.info("You can complete KYC later from your dashboard.");
      router.push("/dashboard");
    }
  }

  return (
    /* Outer card — same max-w as layout, full rounded card with shadow */
    <div className="w-full overflow-hidden rounded-2xl border border-border shadow-sm flex flex-col lg:flex-row min-h-[600px] bg-card">

      {/* ── LEFT PANEL — 40% — white background ─────────────────────── */}
      <div className="w-full lg:w-2/5 flex flex-col bg-card border-b lg:border-b-0 lg:border-r border-border px-8 py-8">

        {/* Back arrow */}
        <button
          type="button"
          onClick={handleBack}
          className="flex h-8 w-8 items-center justify-center rounded-full border border-border bg-background text-foreground hover:bg-muted transition-colors mb-6 self-start"
          aria-label="Back"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>

        {/* Step counter + segmented progress bar */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-sm font-medium text-foreground">
            <span className="text-base font-extrabold">{stepNumber}</span>
            <span className="text-muted-foreground"> of {totalSteps}</span>
          </p>
          <div className="flex items-center gap-1">
            {KYC_STEPS.map((_, i) => (
              <div
                key={i}
                className={cn(
                  "h-1.5 rounded-full transition-all duration-300",
                  i === activeStep
                    ? "w-7 bg-accent"
                    : i < activeStep
                      ? "w-4 bg-accent/40"
                      : "w-4 bg-border"
                )}
              />
            ))}
          </div>
        </div>

        {/* Main heading */}
        <h1 className="text-[22px] font-extrabold leading-snug tracking-tight text-foreground text-balance mb-2">
          One Last Step to Unlock Your Account
        </h1>
        <p className="text-sm text-muted-foreground leading-relaxed mb-8">
          {"We'll guide you through a few simple steps to verify your identity. It only takes a few minutes, and your data stays protected at every step."}
        </p>

        {/* Step list */}
        <ul className="flex flex-col gap-5">
          {KYC_STEPS.map((s, i) => {
            const Icon = s.icon;
            const isActive = i === activeStep;
            const isDone = i < activeStep;
            const isPending = i > activeStep;
            return (
              <li key={s.id} className="flex items-start gap-3.5">
                {/* Icon badge */}
                <div
                  className={cn(
                    "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl mt-0.5 transition-colors",
                    isActive
                      ? "bg-accent/10 text-accent border border-accent/20"
                      : isDone
                        ? "bg-primary/10 text-primary border border-primary/10"
                        : "bg-muted text-muted-foreground/30 border border-transparent"
                  )}
                >
                  <Icon className="h-4.5 w-4.5" />
                </div>
                {/* Text */}
                <div>
                  <p
                    className={cn(
                      "text-sm font-semibold leading-tight",
                      isPending ? "text-muted-foreground/40" : "text-foreground"
                    )}
                  >
                    {s.label}
                  </p>
                  <p
                    className={cn(
                      "text-xs leading-relaxed mt-0.5",
                      isPending
                        ? "text-muted-foreground/30"
                        : "text-muted-foreground"
                    )}
                  >
                    {s.description}
                  </p>
                </div>
              </li>
            );
          })}
        </ul>
      </div>

      {/* ── RIGHT PANEL — 60% — light gray background ────────────────── */}
      <div className="w-full lg:w-3/5 flex flex-col bg-muted/30 px-10 py-10">

        {/* Step form heading */}
        <div className="mb-8">
          <h2 className="text-[26px] font-extrabold tracking-tight text-foreground text-balance leading-snug">
            {step.formTitle}
          </h2>
          <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
            {step.formSubtitle}
          </p>
        </div>

        {/* Input field */}
        <div className="flex flex-col gap-2 mb-5">
          <label className="text-sm font-medium text-foreground">
            {step.inputLabel}
          </label>
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder={step.inputPlaceholder}
            className="bg-card border-border h-12 text-base placeholder:text-muted-foreground/40 rounded-xl focus-visible:ring-accent/30"
          />
        </div>

        {/* Info banner — orange/warning, chevron-right */}
        <div className="mb-5">
          <button
            type="button"
            onClick={() => setShowInfo((v) => !v)}
            className="flex items-center justify-between w-full rounded-xl border border-warning/30 bg-warning/10 px-4 py-3 text-sm font-medium text-warning-foreground hover:bg-warning/15 transition-colors"
          >
            <span className="flex items-center gap-2">
              <Lock className="h-4 w-4 text-warning-foreground/70" />
              {step.infoText}
            </span>
            <ChevronRight
              className={cn(
                "h-4 w-4 text-warning-foreground/60 transition-transform duration-200",
                showInfo && "rotate-90"
              )}
            />
          </button>

          {showInfo && (
            <div className="mt-2 rounded-xl border border-border bg-card px-4 py-3 text-xs text-muted-foreground leading-relaxed">
              {step.infoDetail}
            </div>
          )}
        </div>

        {/* Push Continue to bottom */}
        <div className="flex-1" />

        {/* Continue / Submit button */}
        <Button
          disabled={!inputValue.trim() || isLoading}
          onClick={handleContinue}
          className={cn(
            "w-full h-12 font-semibold tracking-wide text-sm rounded-xl transition-all",
            inputValue.trim()
              ? "bg-accent text-accent-foreground hover:bg-accent/90"
              : "bg-accent/20 text-accent/50 cursor-not-allowed pointer-events-none"
          )}
        >
          {isLoading ? (
            <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Please wait...</>
          ) : isLastStep ? (
            "SUBMIT KYC"
          ) : (
            "Continue"
          )}
        </Button>

        {/* Skip */}
        <button
          type="button"
          onClick={() => {
            toast.info("You can complete KYC later from your dashboard.");
            router.push("/dashboard");
          }}
          className="mt-3 text-center text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          Skip for now — complete KYC later from dashboard
        </button>
      </div>
    </div>
  );
}
