"use client";

import { CheckCircle2, Clock, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

export type OnboardingStep = {
  label: string;
  sublabel: string;
};

export const ONBOARDING_STEPS: OnboardingStep[] = [
  { label: "Validate Email",   sublabel: "Verify your email address" },
  { label: "Validate OTP",     sublabel: "Enter the code we sent you" },
  { label: "Set PIN",          sublabel: "Create a security PIN" },
  { label: "KYC",              sublabel: "Verify your identity" },
];

type StepStatus = "done" | "active" | "pending";

function getStatus(stepIndex: number, activeStep: number): StepStatus {
  if (stepIndex < activeStep) return "done";
  if (stepIndex === activeStep) return "active";
  return "pending";
}

function StepIcon({ status }: { status: StepStatus }) {
  if (status === "done") {
    return (
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 border-primary bg-primary/10">
        <CheckCircle2 className="h-5 w-5 text-primary" />
      </div>
    );
  }
  if (status === "active") {
    return (
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 border-accent bg-accent/10">
        <RefreshCw className="h-4 w-4 animate-spin text-accent" />
      </div>
    );
  }
  return (
    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 border-muted-foreground/30 bg-muted/40">
      <Clock className="h-4 w-4 text-muted-foreground/60" />
    </div>
  );
}

interface AuthOnboardingShellProps {
  /** 0-indexed active step (0=register, 1=verify-otp, 2=create-pin, 3=kyc) */
  activeStep: number;
  children: React.ReactNode;
}

export function AuthOnboardingShell({
  activeStep,
  children,
}: AuthOnboardingShellProps) {
  const total = ONBOARDING_STEPS.length;

  return (
    <div className="w-full overflow-hidden rounded-2xl border border-border/60 shadow-lg shadow-accent/5 flex flex-col lg:flex-row min-h-[520px]">
      {/* ── Left: step tracker panel — 40% ───────────────────────── */}
      <div className="flex flex-col justify-between bg-accent/[0.08] border-b lg:border-b-0 lg:border-r border-border/60 px-7 py-8 w-full lg:w-2/5 shrink-0">
        {/* Step counter */}
        <div>
          <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Registration
          </p>
          <h3 className="mb-7 text-2xl font-extrabold tracking-tight text-foreground">
            Step{" "}
            <span className="text-accent">{activeStep + 1}</span>
            <span className="text-muted-foreground">/{total}</span>
          </h3>

          {/* Steps */}
          <ol className="flex flex-col gap-0">
            {ONBOARDING_STEPS.map((step, i) => {
              const status = getStatus(i, activeStep);
              const isLast = i === ONBOARDING_STEPS.length - 1;
              return (
                <li key={step.label} className="flex gap-3.5">
                  {/* Icon + connector line */}
                  <div className="flex flex-col items-center">
                    <StepIcon status={status} />
                    {!isLast && (
                      <div
                        className={cn(
                          "w-0.5 flex-1 my-1 rounded-full",
                          status === "done"
                            ? "bg-primary/40"
                            : "bg-border"
                        )}
                        style={{ minHeight: 28 }}
                      />
                    )}
                  </div>
                  {/* Text */}
                  <div className="pt-2 pb-2">
                    <p
                      className={cn(
                        "text-sm font-semibold leading-tight",
                        status === "active"
                          ? "text-accent"
                          : status === "done"
                            ? "text-foreground"
                            : "text-muted-foreground/60"
                      )}
                    >
                      {step.label}
                    </p>
                    <p
                      className={cn(
                        "text-xs mt-0.5",
                        status === "active"
                          ? "text-accent/70"
                          : "text-muted-foreground/50"
                      )}
                    >
                      {step.sublabel}
                    </p>
                  </div>
                </li>
              );
            })}
          </ol>
        </div>

        {/* Bottom security note */}
        <p className="mt-6 text-[10px] leading-relaxed text-muted-foreground/50">
          Never share your OTP or PIN with anyone.
        </p>
      </div>

      {/* ── Right: form content panel — 60% ─────────────────────── */}
      <div className="flex w-full lg:w-3/5 flex-col justify-center bg-card px-7 py-8">
        {children}
      </div>
    </div>
  );
}
