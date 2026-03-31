"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { authApi, pendingEmail } from "@/lib/api/auth";
import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import type { VerifyEmailInput } from "@repo/zod-schema";
import { OtpInput } from "@/components/shared/otp-inputs";
import { useOtpCountdown } from "@/lib/utils/use-otp-countdown";
import { AuthOnboardingShell } from "@/components/shared/auth-onboarding-shell";

export default function VerifyOtpPage() {
  const router = useRouter();
  const [otp, setOtp] = useState("");
  const [email, setEmail] = useState("");

  const { countdown, canResend, start: startOtpTimer } = useOtpCountdown({
    initialSeconds: 60,
  });

  useEffect(() => {
    setEmail(pendingEmail.get());
  }, []);

  const verifyMutation = useMutation({
    mutationFn: (data: VerifyEmailInput) => authApi.verifyEmail(data),
    onSuccess: () => {
      pendingEmail.clear();
      toast.success("Email verified successfully!");
      router.replace("/auth/create-pin");
    },
    onError: (err: AxiosError<{ message: string }>) => {
      toast.error(err.response?.data?.message ?? "Invalid or expired OTP.");
      setOtp("");
    },
  });

  const resendMutation = useMutation({
    mutationFn: () => authApi.resendOtp(email),
    onSuccess: () => {
      startOtpTimer();
      toast.success("New OTP sent to your email!");
      setOtp("");
    },
    onError: (err: AxiosError<{ message: string }>) => {
      toast.error(err.response?.data?.message ?? "Failed to resend OTP.");
    },
  });

  const handleVerify = () => {
    if (otp.length < 6) return;
    verifyMutation.mutate({ email, otp });
  };

  return (
    <AuthOnboardingShell activeStep={1}>
      <div className="mb-6">
        <p className="text-xs font-semibold uppercase tracking-widest text-accent mb-1">
          Step 2 — Verify Email
        </p>
        <h2 className="text-[22px] font-extrabold tracking-tight text-foreground text-balance">
          Validate your email
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {"Enter the 6-digit OTP sent to "}
          <span className="font-semibold text-foreground">{email || "your email"}</span>
        </p>
      </div>

      <div className="flex flex-col gap-5">
        <div>
          <p className="mb-3 text-sm font-medium text-foreground">Enter OTP</p>
          <OtpInput value={otp} onChange={setOtp} onComplete={handleVerify} />
        </div>

        <Button
          onClick={handleVerify}
          disabled={otp.length < 6 || verifyMutation.isPending}
          className="w-full bg-accent text-accent-foreground hover:bg-accent/90 font-semibold tracking-wide"
        >
          {verifyMutation.isPending ? (
            <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Verifying...</>
          ) : (
            "VERIFY & CONTINUE"
          )}
        </Button>

        <p className="text-center text-sm text-muted-foreground">
          {canResend ? (
            <button
              onClick={() => resendMutation.mutate()}
              disabled={resendMutation.isPending}
              className="text-accent font-medium hover:underline"
            >
              {resendMutation.isPending ? "Sending..." : "Resend OTP"}
            </button>
          ) : (
            <>
              Resend OTP after{" "}
              <span className="font-bold text-foreground">{countdown} Sec</span>
            </>
          )}
        </p>

        <p className="text-center text-xs text-muted-foreground">
          Never share your OTP or PIN with anyone.
        </p>
      </div>
    </AuthOnboardingShell>
  );
}
