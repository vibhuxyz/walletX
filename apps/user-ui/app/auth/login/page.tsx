"use client";

import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { toast } from "sonner";
import { authApi, pendingEmail } from "@/lib/api/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import {
  Eye,
  EyeOff,
  Loader2,
  ShieldCheck,
  ArrowLeft,
  UserX,
  KeyRound,
  RotateCcw,
  User,
  ArrowLeftRight,
  Zap,
  TrendingUp,
  Wallet,
} from "lucide-react";

import { useAuth } from "@/lib/auth-context";
import { TEST_ACCOUNTS } from "@/lib/testAccount";
import { useOtpCountdown } from "@/lib/utils/use-otp-countdown";

// ── Schemas ───────────────────────────────────────────────────────
const loginFormSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});
type LoginForm = z.infer<typeof loginFormSchema>;

const otpFormSchema = z.object({
  otp: z.string().length(6, "Enter the 6-digit code"),
});
type OtpForm = z.infer<typeof otpFormSchema>;

// ── Error type ────────────────────────────────────────────────────
type LoginErrorType =
  | "user_not_found"
  | "wrong_password"
  | "reset_required"
  | null;

type ApiErrorResponse = {
  message?: string;
  code?: string;
  error?: string | { code?: string; message?: string };
};

const MAX_PASSWORD_ATTEMPTS = 3;

// ── Component ─────────────────────────────────────────────────────
export default function LoginPage() {
  const { login } = useAuth();

  const [screen, setScreen] = useState<"login" | "otp">("login");
  const [maskedEmail, setMaskedEmail] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // track login error state and wrong-password attempts
  const [loginError, setLoginError] = useState<LoginErrorType>(null);
  const [passwordAttempts, setPasswordAttempts] = useState(0);
  const { countdown, canResend, start: startOtpTimer } = useOtpCountdown({
    initialSeconds: 60,
    autoStart: false,
  });

  const loginForm = useForm<LoginForm>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: { email: "", password: "" },
  });

  function classifyError(
    data: Record<string, string> | undefined,
  ): LoginErrorType {
    if (!data) return null;

    // primary signal: the `error` enum field
    const errorCode = (data.error ?? "").toUpperCase();
    // Fallback: human-readable message or code string
    const text = (data.message ?? data.code ?? "").toLowerCase();

    if (
      errorCode.includes("USER_NOT_FOUND") ||
      errorCode.includes("NOT_FOUND") ||
      text.includes("not found") ||
      text.includes("no user") ||
      text.includes("does not exist") ||
      text.includes("user not found")
    ) {
      return "user_not_found";
    }

    if (
      errorCode.includes("WRONG_PASSWORD") ||
      errorCode.includes("INVALID_PASSWORD") ||
      errorCode.includes("INVALID_CREDENTIALS") ||
      text.includes("password") ||
      text.includes("incorrect") ||
      text.includes("invalid credentials") ||
      text.includes("wrong password")
    ) {
      return "wrong_password";
    }

    return null;
  }

  function getErrorFields(data: ApiErrorResponse | undefined) {
    if (!data) {
      return { code: "", message: "", error: "" };
    }

    if (data.error && typeof data.error === "object") {
      return {
        code: data.error.code ?? "",
        message: data.error.message ?? "",
        error: data.error.code ?? "",
      };
    }

    return {
      code: data.code ?? "",
      message: data.message ?? "",
      error: typeof data.error === "string" ? data.error : "",
    };
  }

  const loginMutation = useMutation({
    mutationFn: (data: LoginForm) => authApi.loginUser(data),
    onSuccess: async (res) => {
      setLoginError(null);
      setPasswordAttempts(0);

      const data = res.data?.data;
      if (data?.status === "OTP_REQUIRED") {
        setMaskedEmail(data.maskedEmail);
        pendingEmail.set(loginForm.getValues("email"));
        setScreen("otp");
        startOtpTimer();
        toast.info(`Verification code sent to ${data.maskedEmail}`);
      } else if (data?.status === "SUCCESS") {
        toast.success(`Welcome back, ${data.user?.fullName ?? ""}!`);
        await login();
      }
    },
    onError: (err: AxiosError<ApiErrorResponse>) => {
      const fields = getErrorFields(err.response?.data);
      const errorType = classifyError(fields);

      if (errorType === "wrong_password") {
        const newAttempts = passwordAttempts + 1;
        setPasswordAttempts(newAttempts);

        if (newAttempts >= MAX_PASSWORD_ATTEMPTS) {
          setLoginError("reset_required");
          loginForm.setError("password", {
            message: "Too many failed attempts.",
          });
        } else {
          setLoginError("wrong_password");
          loginForm.setError("password", {
            message: `Incorrect password. ${MAX_PASSWORD_ATTEMPTS - newAttempts} attempt(s) remaining.`,
          });
        }
      } else if (errorType === "user_not_found") {
        setLoginError("user_not_found");
        loginForm.setError("email", {
          message: "No account found with this email.",
        });
      } else {
        setLoginError(null);

        const msg =
          fields.message ||
          fields.code ||
          fields.error ||
          "Login failed. Please try again.";
        toast.error(msg);
      }
    },
  });

  // OTP form
  const otpForm = useForm<OtpForm>({
    resolver: zodResolver(otpFormSchema),
    defaultValues: { otp: "" },
  });

  const otpMutation = useMutation({
    mutationFn: (data: OtpForm) =>
      authApi.verifyLoginOtp({ email: pendingEmail.get(), otp: data.otp }),
    onSuccess: async (res: any) => {
      const data = res.data?.data;
      pendingEmail.clear();
      toast.success(`Welcome back, ${data?.user?.fullName ?? ""}!`);
      await login();
    },
    onError: (err: AxiosError<ApiErrorResponse>) => {
      const fields = getErrorFields(err.response?.data);
      const msg = fields.message || "Invalid code. Please try again.";
      toast.error(msg);
      otpForm.setError("otp", { message: msg });
    },
  });

  const resendMutation = useMutation({
    mutationFn: () => authApi.resendLoginOtp(pendingEmail.get()),
    onSuccess: () => {
      startOtpTimer();
      toast.success("New code sent to your email");
    },
    onError: (err: AxiosError<ApiErrorResponse>) => {
      const fields = getErrorFields(err.response?.data);
      toast.error(fields.message || "Failed to resend code");
    },
  });

  function quickLogin(account: (typeof TEST_ACCOUNTS)["customer"]) {
    loginForm.setValue("email", account.email, { shouldValidate: true });
    loginForm.setValue("password", account.password, { shouldValidate: true });
    setLoginError(null);
  }

  // ── Feature data for the left panel ──────────────────────────
  const FEATURES = [
    { icon: ArrowLeftRight, label: "Instant Transfers" },
    { icon: ShieldCheck,    label: "Bank-Grade Security" },
    { icon: Zap,            label: "Zero Fees" },
    { icon: TrendingUp,     label: "Smart Analytics" },
  ];

  // ── Shared wrapper ────────────────────────────────────────────
  function LoginShell({ children }: { children: React.ReactNode }) {
    return (
      <div className="w-full overflow-hidden rounded-2xl border border-border/60 shadow-lg shadow-accent/5 flex flex-col lg:flex-row min-h-[520px]">
        {/* Left: accent feature panel — 40% */}
        <div className="flex flex-col justify-between bg-accent px-8 py-10 w-full lg:w-2/5 shrink-0">
          <div>
            <div className="flex items-center gap-2.5 mb-10">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent-foreground/15">
                <Wallet className="h-4 w-4 text-accent-foreground" />
              </div>
              <span className="text-base font-bold tracking-tight text-accent-foreground">FineWallet</span>
            </div>
            <h2 className="text-[26px] font-extrabold leading-tight text-accent-foreground text-balance mb-2">
              Smart &amp; Secure<br />Wallet
            </h2>
            <p className="text-sm text-accent-foreground/70 leading-relaxed mb-8">
              Embark on your journey effortlessly! Get started in just a few simple steps.
            </p>
            <ul className="flex flex-col gap-4">
              {FEATURES.map(({ icon: Icon, label }) => (
                <li key={label} className="flex items-center gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-accent-foreground/10">
                    <Icon className="h-4 w-4 text-primary" />
                  </div>
                  <span className="text-sm font-medium text-accent-foreground/90">{label}</span>
                </li>
              ))}
            </ul>
          </div>
          <p className="text-[10px] text-accent-foreground/35 mt-6 leading-relaxed">
            Never share your OTP or PIN with anyone.
          </p>
        </div>

        {/* Right: form panel — 60% */}
        <div className="flex w-full lg:w-3/5 flex-col justify-center bg-card px-8 py-10">
          {children}
        </div>
      </div>
    );
  }

  // OTP screen
  if (screen === "otp") {
    return (
      <LoginShell>
        <div className="mb-1 flex items-center gap-2">
          <button
            type="button"
            onClick={() => { setScreen("login"); otpForm.reset(); }}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-muted/40 text-muted-foreground transition-colors hover:text-foreground"
            aria-label="Back to login"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <span className="text-sm text-muted-foreground">Back to login</span>
        </div>

        <div className="mt-5 mb-6">
          <p className="text-xs font-semibold uppercase tracking-widest text-accent mb-1">New device detected</p>
          <h2 className="text-[22px] font-extrabold tracking-tight text-foreground text-balance">
            Validate your login
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {"Enter the 6-digit OTP sent to "}
            <span className="font-semibold text-foreground">{maskedEmail}</span>
          </p>
        </div>

        <div className="flex flex-col gap-5">
          <div>
            <p className="mb-3 text-sm font-medium text-foreground">Enter OTP</p>
            <InputOTP
              maxLength={6}
              value={otpForm.watch("otp")}
              onChange={(val) => { otpForm.setValue("otp", val); otpForm.clearErrors("otp"); }}
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
            {otpForm.formState.errors.otp && (
              <p className="text-xs text-destructive mt-2">{otpForm.formState.errors.otp.message}</p>
            )}
          </div>

          <Button
            type="button"
            disabled={otpMutation.isPending}
            className="w-full bg-accent text-accent-foreground hover:bg-accent/90 font-semibold tracking-wide"
            onClick={() => otpForm.handleSubmit((d) => otpMutation.mutate(d))()}
          >
            {otpMutation.isPending ? (
              <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Verifying...</>
            ) : (
              "VERIFY & SIGN IN"
            )}
          </Button>

          <p className="text-center text-sm text-muted-foreground">
            {canResend ? (
              <button
                type="button"
                disabled={resendMutation.isPending}
                className="text-accent font-medium hover:underline"
                onClick={() => resendMutation.mutate()}
              >
                {resendMutation.isPending ? (
                  <><Loader2 className="inline h-3.5 w-3.5 animate-spin mr-1" />Sending...</>
                ) : (
                  "Resend OTP"
                )}
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
      </LoginShell>
    );
  }

  // Login screen
  return (
    <LoginShell>
      <div className="mb-6">
        <p className="text-xs font-semibold uppercase tracking-widest text-accent mb-1">Sign In</p>
        <h2 className="text-[22px] font-extrabold tracking-tight text-foreground text-balance">
          Welcome back
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Sign in to your FineWallet account
        </p>
      </div>

      {/* Test accounts */}
      <div className="mb-5 rounded-xl border border-dashed border-border bg-muted/30 p-3.5">
        <p className="mb-2.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Test Accounts
        </p>
        <div className="flex flex-col gap-1.5">
          {[
            { ...TEST_ACCOUNTS.customer,          label: "Customer (No KYC)",      icon: User,         color: "text-primary bg-primary/10" },
            { ...TEST_ACCOUNTS.verified_customer, label: "Customer (KYC Approved)", icon: ShieldCheck,  color: "text-success bg-success/10" },
          ].map((acc) => (
            <button
              key={acc.email}
              type="button"
              onClick={() => quickLogin(acc)}
              className="flex items-center gap-2.5 rounded-lg border border-border bg-card p-2 text-left transition-colors hover:border-accent/40 hover:bg-accent/5"
            >
              <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${acc.color}`}>
                <acc.icon className="h-3.5 w-3.5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-medium text-foreground">{acc.label}</p>
                <p className="truncate text-[11px] text-muted-foreground">{acc.email}</p>
              </div>
            </button>
          ))}
        </div>
        <p className="mt-2 text-center text-[11px] text-muted-foreground">
          Password: <span className="font-mono font-medium text-foreground">Password123</span>
        </p>
      </div>

      <div className="flex flex-col gap-4">
        {loginError === "user_not_found" && (
          <div className="flex items-start gap-3 rounded-lg border border-destructive/30 bg-destructive/5 px-3.5 py-3 text-sm text-destructive">
            <UserX className="mt-0.5 h-4 w-4 shrink-0" />
            <div>
              <p className="font-semibold">No account found</p>
              <p className="text-destructive/80 text-xs mt-0.5">
                <Link href="/auth/register" className="font-semibold underline underline-offset-2">Sign up instead</Link>.
              </p>
            </div>
          </div>
        )}

        {loginError === "wrong_password" && (
          <div className="flex items-start gap-3 rounded-lg border border-warning/30 bg-warning/5 px-3.5 py-3 text-sm text-warning-foreground">
            <KeyRound className="mt-0.5 h-4 w-4 shrink-0" />
            <div>
              <p className="font-semibold">Incorrect password</p>
              <p className="text-xs mt-0.5 opacity-80">Please double-check and try again.</p>
            </div>
          </div>
        )}

        {loginError === "reset_required" && (
          <div className="flex items-start gap-3 rounded-lg border border-destructive/30 bg-destructive/5 px-3.5 py-3 text-sm text-destructive">
            <RotateCcw className="mt-0.5 h-4 w-4 shrink-0" />
            <div>
              <p className="font-semibold">Too many failed attempts</p>
              <p className="text-destructive/80 text-xs mt-0.5">
                <Link href="/auth/forgot-password" className="font-semibold underline underline-offset-2">Reset your password</Link>{" "}to regain access.
              </p>
            </div>
          </div>
        )}

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="email">Email address</Label>
          <Input
            id="email"
            type="email"
            placeholder="you@example.com"
            className={loginForm.formState.errors.email ? "border-destructive" : ""}
            {...loginForm.register("email", {
              onChange: () => { if (loginError === "user_not_found") { setLoginError(null); loginForm.clearErrors("email"); } },
            })}
          />
          {loginForm.formState.errors.email && (
            <p className="text-xs text-destructive">{loginForm.formState.errors.email.message}</p>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Password</Label>
            <Link
              href="/auth/forgot-password"
              className={`text-xs transition-colors hover:underline ${loginError === "reset_required" ? "font-semibold text-destructive" : "text-accent"}`}
            >
              {loginError === "reset_required" ? "Reset password" : "Forgot password?"}
            </Link>
          </div>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              className={loginForm.formState.errors.password ? "border-destructive pr-10" : "pr-10"}
              {...loginForm.register("password", {
                onChange: () => {
                  if (loginError === "wrong_password" || loginError === "reset_required") {
                    setLoginError(null); loginForm.clearErrors("password");
                  }
                },
              })}
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {loginForm.formState.errors.password && (
            <p className="text-xs text-destructive">{loginForm.formState.errors.password.message}</p>
          )}
        </div>

        <Button
          type="button"
          disabled={loginMutation.isPending || loginError === "reset_required"}
          className="mt-1 w-full bg-accent text-accent-foreground hover:bg-accent/90 font-semibold tracking-wide disabled:opacity-60"
          onClick={() => loginForm.handleSubmit((d) => loginMutation.mutate(d))()}
        >
          {loginMutation.isPending ? (
            <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Signing in...</>
          ) : loginError === "reset_required" ? (
            "Sign in disabled — reset password first"
          ) : (
            "SIGN IN"
          )}
        </Button>
      </div>

      <p className="mt-5 text-center text-sm text-muted-foreground">
        {"Don't have an account? "}
        <Link href="/auth/register" className="font-semibold text-accent hover:underline">
          Create one
        </Link>
      </p>
    </LoginShell>
  );
}
