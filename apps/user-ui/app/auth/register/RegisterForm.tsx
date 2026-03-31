"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, Loader2, MailWarning, PhoneOff } from "lucide-react";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { authApi, pendingEmail } from "@/lib/api/auth";
import { AxiosError } from "axios";
import { useRouter } from "next/navigation";
import { registerSchema, type RegisterInput } from "@repo/zod-schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { AuthOnboardingShell } from "@/components/shared/auth-onboarding-shell";

type RegisterErrorType = "email_exists" | "phone_exists" | null;

function classifyRegisterError(
  data: Record<string, string> | undefined,
): RegisterErrorType {
  if (!data) return null;
  const errorCode = (data.error ?? "").toUpperCase();
  const message = (data.message ?? data.code ?? "").toLowerCase();
  if (
    errorCode.includes("EMAIL") ||
    (message.includes("email") &&
      (message.includes("exist") || message.includes("registered") || message.includes("taken")))
  ) return "email_exists";
  if (
    errorCode.includes("PHONE") ||
    (message.includes("phone") &&
      (message.includes("exist") || message.includes("registered") || message.includes("taken")))
  ) return "phone_exists";
  return null;
}

export default function RegisterForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [registerError, setRegisterError] = useState<RegisterErrorType>(null);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    setError,
    clearErrors,
    formState: { errors },
  } = useForm<RegisterInput>({ resolver: zodResolver(registerSchema) });

  const registerMutation = useMutation({
    mutationFn: authApi.register,
    onSuccess: (_, vars) => {
      setRegisterError(null);
      pendingEmail.set(vars.email);
      toast.success(`OTP sent to ${vars.email}!`);
      router.replace("/auth/verify-otp");
    },
    onError: (err: AxiosError<Record<string, string>>) => {
      const data = err.response?.data;
      const errorType = classifyRegisterError(data);
      if (errorType === "email_exists") {
        setRegisterError("email_exists");
        setError("email", { message: "This email is already registered." });
      } else if (errorType === "phone_exists") {
        setRegisterError("phone_exists");
        setError("phone", { message: "This phone number is already in use." });
      } else {
        setRegisterError(null);
        toast.error(data?.message ?? data?.code ?? data?.error ?? "Registration failed. Please try again.");
      }
    },
  });

  return (
    <AuthOnboardingShell activeStep={0}>
      <div className="mb-6">
        <p className="text-xs font-semibold uppercase tracking-widest text-accent mb-1">
          Create Account
        </p>
        <h2 className="text-[22px] font-extrabold tracking-tight text-foreground text-balance">
          Welcome to WalletX
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Get started in just a few simple steps — it&apos;s free.
        </p>
      </div>

      <form
        onSubmit={handleSubmit((data) => registerMutation.mutate(data))}
        className="flex flex-col gap-3.5"
      >
        {registerError === "email_exists" && (
          <div className="flex items-start gap-3 rounded-lg border border-destructive/30 bg-destructive/5 px-3.5 py-3 text-sm text-destructive">
            <MailWarning className="mt-0.5 h-4 w-4 shrink-0" />
            <div>
              <p className="font-semibold">Email already registered</p>
              <p className="text-destructive/80 text-xs mt-0.5">
                <Link href="/auth/login" className="font-semibold underline underline-offset-2">Sign in instead</Link>.
              </p>
            </div>
          </div>
        )}

        {registerError === "phone_exists" && (
          <div className="flex items-start gap-3 rounded-lg border border-warning/30 bg-warning/5 px-3.5 py-3 text-sm text-warning-foreground">
            <PhoneOff className="mt-0.5 h-4 w-4 shrink-0" />
            <div>
              <p className="font-semibold">Phone already in use</p>
              <p className="text-xs mt-0.5 opacity-80">Please use a different number.</p>
            </div>
          </div>
        )}

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="fullName">Full name</Label>
          <Input
            id="fullName"
            placeholder="Alex Johnson"
            className={errors.fullName ? "border-destructive" : ""}
            {...register("fullName")}
          />
          {errors.fullName && <p className="text-xs text-destructive">{errors.fullName.message}</p>}
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="reg-email">Email address</Label>
          <Input
            id="reg-email"
            type="email"
            placeholder="you@email.com"
            className={errors.email ? "border-destructive" : ""}
            {...register("email", {
              onChange: () => {
                if (registerError === "email_exists") { setRegisterError(null); clearErrors("email"); }
              },
            })}
          />
          {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="phone">Phone number</Label>
          <Input
            id="phone"
            type="tel"
            placeholder="9876543210"
            maxLength={10}
            className={errors.phone ? "border-destructive" : ""}
            {...register("phone", {
              onChange: () => {
                if (registerError === "phone_exists") { setRegisterError(null); clearErrors("phone"); }
              },
            })}
          />
          {errors.phone && <p className="text-xs text-destructive">{errors.phone.message}</p>}
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="reg-password">Password</Label>
          <div className="relative">
            <Input
              id="reg-password"
              type={showPassword ? "text" : "password"}
              placeholder="Create a strong password"
              className={errors.password ? "border-destructive pr-10" : "pr-10"}
              {...register("password")}
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              onClick={() => setShowPassword((p) => !p)}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {errors.password ? (
            <p className="text-xs text-destructive">{errors.password.message}</p>
          ) : (
            <p className="text-xs text-muted-foreground">Min 8 chars with uppercase, number &amp; special character</p>
          )}
        </div>

        <Button
          type="submit"
          disabled={registerMutation.isPending}
          className="mt-2 w-full bg-accent text-accent-foreground hover:bg-accent/90 font-semibold tracking-wide"
        >
          {registerMutation.isPending ? (
            <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Creating account...</>
          ) : (
            "PROCEED"
          )}
        </Button>
      </form>

      <p className="mt-5 text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link href="/auth/login" className="font-semibold text-accent hover:underline">
          Sign in
        </Link>
      </p>
    </AuthOnboardingShell>
  );
}
