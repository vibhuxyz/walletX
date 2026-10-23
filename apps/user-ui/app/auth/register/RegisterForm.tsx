"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
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

function classifyRegisterError(data: any): RegisterErrorType {
  if (!data) return null;
  const errorCode = (
    data.error?.code ??
    data.code ??
    (typeof data.error === "string" ? data.error : "")
  )
    .toString()
    .toUpperCase();
  const message = (data.error?.message ?? data.message ?? "")
    .toString()
    .toLowerCase();
  if (
    errorCode.includes("EMAIL") ||
    (message.includes("email") &&
      (message.includes("exist") ||
        message.includes("registered") ||
        message.includes("taken")))
  )
    return "email_exists";
  if (
    errorCode.includes("PHONE") ||
    (message.includes("phone") &&
      (message.includes("exist") ||
        message.includes("registered") ||
        message.includes("taken")))
  )
    return "phone_exists";
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
    onError: (err: AxiosError<any>) => {
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
        const errMsg =
          data?.error?.message ??
          data?.message ??
          (typeof data?.error === "string" ? data.error : null) ??
          data?.error?.code ??
          data?.code ??
          "Registration failed. Please try again.";
        toast.error(
          !err.response
            ? "Cannot reach WalletX API. Start the API gateway and auth service, then try again."
            : errMsg,
        );
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
          <Alert variant="destructive">
            <MailWarning className="h-4 w-4" />
            <AlertTitle>Email already registered</AlertTitle>
            <AlertDescription>
              <Link
                href="/auth/login"
                className="font-semibold underline underline-offset-2"
              >
                Sign in instead
              </Link>
              .
            </AlertDescription>
          </Alert>
        )}

        {registerError === "phone_exists" && (
          <Alert variant="destructive">
            <PhoneOff className="h-4 w-4" />
            <AlertTitle>Phone already in use</AlertTitle>
            <AlertDescription>Please use a different number.</AlertDescription>
          </Alert>
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
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-transparent"
              onClick={() => setShowPassword((p) => !p)}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </Button>
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
