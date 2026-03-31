"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { toast } from "sonner";
import { ArrowLeft, KeyRound, Loader2, Mail } from "lucide-react";
import { authApi } from "@/lib/api/auth";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { useOtpCountdown } from "@/lib/utils/use-otp-countdown";

type ApiErrorResponse = {
  message?: string;
  code?: string;
  error?: string | { code?: string; message?: string };
};

const requestOtpSchema = z.object({
  email: z.string().email("Enter a valid email"),
});
type RequestOtpForm = z.infer<typeof requestOtpSchema>;

const resetSchema = z
  .object({
    otp: z.string().regex(/^\d{6}$/, "OTP must be 6 digits"),
    newPassword: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z
      .string()
      .min(8, "Password must be at least 8 characters"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });
type ResetForm = z.infer<typeof resetSchema>;

function getErrorMessage(data: ApiErrorResponse | undefined, fallback: string) {
  if (!data) return fallback;
  if (data.error && typeof data.error === "object") {
    return data.error.message || data.error.code || fallback;
  }
  return data.message || data.code || fallback;
}

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [step, setStep] = useState<"request" | "reset">("request");
  const [email, setEmail] = useState("");
  const { countdown, canResend, start: startOtpTimer } = useOtpCountdown({
    initialSeconds: 60,
    autoStart: false,
  });

  const requestForm = useForm<RequestOtpForm>({
    resolver: zodResolver(requestOtpSchema),
    defaultValues: { email: "" },
  });

  const resetForm = useForm<ResetForm>({
    resolver: zodResolver(resetSchema),
    defaultValues: { otp: "", newPassword: "", confirmPassword: "" },
  });

  const requestOtpMutation = useMutation({
    mutationFn: (data: RequestOtpForm) => authApi.forgotPassword(data),
    onSuccess: (_, vars) => {
      setEmail(vars.email.trim().toLowerCase());
      setStep("reset");
      startOtpTimer();
      toast.success("If the email exists, OTP has been sent.");
    },
    onError: (err: AxiosError<ApiErrorResponse>) => {
      toast.error(
        getErrorMessage(err.response?.data, "Failed to send reset OTP"),
      );
    },
  });

  const resendOtpMutation = useMutation({
    mutationFn: () => authApi.resendForgotPasswordOtp(email),
    onSuccess: () => {
      startOtpTimer();
      toast.success("Password reset OTP resent");
    },
    onError: (err: AxiosError<ApiErrorResponse>) => {
      toast.error(getErrorMessage(err.response?.data, "Failed to resend OTP"));
    },
  });

  const resetPasswordMutation = useMutation({
    mutationFn: (data: ResetForm) =>
      authApi.resetPassword({
        email,
        otp: data.otp,
        newPassword: data.newPassword,
        confirmPassword: data.confirmPassword,
      }),
    onSuccess: () => {
      toast.success("Password reset successfully");
      router.push("/auth/login");
    },
    onError: (err: AxiosError<ApiErrorResponse>) => {
      const message = getErrorMessage(
        err.response?.data,
        "Password reset failed",
      );
      toast.error(message);
      if (message.toLowerCase().includes("otp")) {
        resetForm.setError("otp", { message });
      }
    },
  });

  if (step === "request") {
    return (
      <Card className="border-border/50 shadow-lg">
        <CardHeader className="text-center pb-2">
          <CardTitle className="text-2xl font-bold text-foreground">
            Forgot password
          </CardTitle>
          <CardDescription>
            Enter your email and we&apos;ll send you a reset OTP
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              {...requestForm.register("email")}
            />
            {requestForm.formState.errors.email && (
              <p className="text-xs text-destructive">
                {requestForm.formState.errors.email.message}
              </p>
            )}
          </div>

          <Button
            type="button"
            disabled={requestOtpMutation.isPending}
            className="bg-accent text-accent-foreground hover:bg-accent/90 font-semibold"
            onClick={() =>
              requestForm.handleSubmit((data) => requestOtpMutation.mutate(data))()
            }
          >
            {requestOtpMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending OTP...
              </>
            ) : (
              <>
                <Mail className="mr-2 h-4 w-4" />
                Send reset OTP
              </>
            )}
          </Button>

          <Link
            href="/auth/login"
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to login
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border/50 shadow-lg">
      <CardHeader className="text-center pb-2">
        <CardTitle className="text-2xl font-bold text-foreground">
          Reset password
        </CardTitle>
        <CardDescription>
          Enter OTP sent to <span className="font-medium">{email}</span>
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="flex flex-col items-center gap-2">
          <InputOTP
            maxLength={6}
            value={resetForm.watch("otp")}
            onChange={(value) => {
              resetForm.setValue("otp", value);
              resetForm.clearErrors("otp");
            }}
          >
            <InputOTPGroup>
              <InputOTPSlot index={0} />
              <InputOTPSlot index={1} />
              <InputOTPSlot index={2} />
              <InputOTPSlot index={3} />
              <InputOTPSlot index={4} />
              <InputOTPSlot index={5} />
            </InputOTPGroup>
          </InputOTP>
          {resetForm.formState.errors.otp && (
            <p className="text-xs text-destructive">
              {resetForm.formState.errors.otp.message}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="newPassword">New password</Label>
          <Input
            id="newPassword"
            type="password"
            placeholder="Enter new password"
            {...resetForm.register("newPassword")}
          />
          {resetForm.formState.errors.newPassword && (
            <p className="text-xs text-destructive">
              {resetForm.formState.errors.newPassword.message}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="confirmPassword">Confirm password</Label>
          <Input
            id="confirmPassword"
            type="password"
            placeholder="Re-enter new password"
            {...resetForm.register("confirmPassword")}
          />
          {resetForm.formState.errors.confirmPassword && (
            <p className="text-xs text-destructive">
              {resetForm.formState.errors.confirmPassword.message}
            </p>
          )}
        </div>

        <Button
          type="button"
          disabled={resetPasswordMutation.isPending}
          className="bg-accent text-accent-foreground hover:bg-accent/90 font-semibold"
          onClick={() =>
            resetForm.handleSubmit((data) => resetPasswordMutation.mutate(data))()
          }
        >
          {resetPasswordMutation.isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Resetting...
            </>
          ) : (
            <>
              <KeyRound className="mr-2 h-4 w-4" />
              Reset password
            </>
          )}
        </Button>

        <div className="flex items-center justify-between text-sm">
          <button
            type="button"
            className="text-muted-foreground hover:text-foreground"
            onClick={() => setStep("request")}
          >
            Use different email
          </button>
          <button
            type="button"
            disabled={!canResend || resendOtpMutation.isPending}
            className="text-primary hover:underline disabled:opacity-50"
            onClick={() => resendOtpMutation.mutate()}
          >
            {resendOtpMutation.isPending
              ? "Resending..."
              : canResend
                ? "Resend OTP"
                : `Resend OTP in ${countdown}s`}
          </button>
        </div>
      </CardContent>
    </Card>
  );
}
