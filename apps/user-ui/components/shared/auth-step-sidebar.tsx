"use client";

import { Check, Clock, Mail, Lock, ShieldCheck } from "lucide-react";

export type OnboardingStep = {
  label: string;
  description: string;
  icon: "mail" | "lock" | "shield";
};

const ONBOARDING_STEPS: OnboardingStep[] = [
  { label: "Verify Email", description: "Verify your email address", icon: "mail" },
  { label: "Set PIN", description: "Create a security PIN", icon: "lock" },
  { label: "KYC", description: "Verify your identity", icon: "shield" },
];

interface AuthStepSidebarProps {
  currentStep: number; // 0-indexed: 0=verify-otp, 1=create-pin, 2=kyc
}

function StepIcon({
  icon,
  status,
}: {
  icon: OnboardingStep["icon"];
  status: "done" | "active" | "pending";
}) {
  const iconClass = "h-4 w-4";

  if (status === "done") {
    return <Check className={iconClass} />;
  }

  if (icon === "mail") return <Mail className={iconClass} />;
  if (icon === "lock") return <Lock className={iconClass} />;
  return <ShieldCheck className={iconClass} />;
}

export function AuthStepSidebar({ currentStep }: AuthStepSidebarProps) {
  const totalSteps = ONBOARDING_STEPS.length;

  return (
    <div className="flex flex-col gap-1 rounded-xl border border-border/60 bg-secondary/40 p-5">
      <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
        Step {currentStep + 1} of {totalSteps}
      </p>

      <div className="flex flex-col gap-0">
        {ONBOARDING_STEPS.map((step, i) => {
          const status =
            i < currentStep ? "done" : i === currentStep ? "active" : "pending";

          return (
            <div key={step.label} className="flex flex-col">
              {/* Step row */}
              <div className="flex items-start gap-3">
                {/* Icon bubble */}
                <div
                  className={`relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold transition-all ${
                    status === "done"
                      ? "bg-primary text-primary-foreground shadow-sm shadow-primary/30"
                      : status === "active"
                        ? "bg-accent text-accent-foreground ring-2 ring-accent/30 ring-offset-2 ring-offset-background"
                        : "bg-muted text-muted-foreground"
                  }`}
                >
                  <StepIcon icon={step.icon} status={status} />
                </div>

                {/* Label */}
                <div className="pt-0.5">
                  <p
                    className={`text-sm font-semibold leading-tight ${
                      status === "active"
                        ? "text-accent"
                        : status === "done"
                          ? "text-primary"
                          : "text-muted-foreground"
                    }`}
                  >
                    {step.label}
                  </p>
                  <p className="text-xs text-muted-foreground">{step.description}</p>
                </div>
              </div>

              {/* Connector line between steps */}
              {i < totalSteps - 1 && (
                <div className="ml-4 flex w-0 flex-col items-center">
                  <div
                    className={`my-1 h-6 w-px ${
                      i < currentStep ? "bg-primary/50" : "bg-border"
                    }`}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Security note */}
      <div className="mt-5 flex items-center gap-2 rounded-lg border border-border/50 bg-background px-3 py-2.5">
        <Clock className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
        <p className="text-xs text-muted-foreground">
          Never share your OTP or PIN with anyone.
        </p>
      </div>
    </div>
  );
}
