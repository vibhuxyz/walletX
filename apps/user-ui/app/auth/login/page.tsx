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
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { OtpSlotInput } from "@/components/ui/otp-slot-input";
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

// ── Module-level constants (stable references — never re-mount children) ───────
const FEATURES = [
  { icon: ArrowLeftRight, label: "Instant Transfers" },
  { icon: ShieldCheck, label: "Bank-Grade Security" },
  { icon: Zap, label: "Zero Fees" },
  { icon: TrendingUp, label: "Smart Analytics" },
];

const TEST_ACCOUNT_ITEMS = [
  {
    ...TEST_ACCOUNTS.trial_user,
    label: "Trial User (Login Without OTP/PIN Setup)",
    icon: Zap,
    color: "text-purple-500 bg-purple-500/10 border-purple-500/50 border",
  },
  {
    ...TEST_ACCOUNTS.customer,
    label: "Customer (No KYC)",
    icon: User,
    color: "text-primary bg-primary/10",
  },
  {
    ...TEST_ACCOUNTS.verified_customer,
    label: "Customer (KYC Approved)",
    icon: ShieldCheck,
    color: "text-success bg-success/10",
  },
];

function LoginShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="w-full overflow-hidden rounded-2xl border border-border/60 shadow-lg shadow-accent/5 flex flex-col lg:flex-row min-h-[520px]">
      {/* Left accent panel */}
      <div className="flex flex-col justify-between bg-accent px-8 py-10 w-full lg:w-2/5 shrink-0">
        <div>
          <div className="flex items-center gap-2.5 mb-10">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent-foreground/15">
              <Wallet className="h-4 w-4 text-accent-foreground" />
            </div>
            <span className="text-base font-bold tracking-tight text-accent-foreground">
              WalletX
            </span>
          </div>
          <h2 className="text-[26px] font-extrabold leading-tight text-accent-foreground text-balance mb-2">
            Smart &amp; Secure
            <br />
            Wallet
          </h2>
          <p className="text-sm text-accent-foreground/70 leading-relaxed mb-8">
            Embark on your journey effortlessly! Get started in just a few
            simple steps.
          </p>
          <ul className="flex flex-col gap-4">
            {FEATURES.map(({ icon: Icon, label }) => (
              <li key={label} className="flex items-center gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-accent-foreground/10">
                  <Icon className="h-4 w-4 text-primary" />
                </div>
                <span className="text-sm font-medium text-accent-foreground/90">
                  {label}
                </span>
              </li>
            ))}
          </ul>
        </div>
        <p className="text-[10px] text-accent-foreground/35 mt-6 leading-relaxed">
          Never share your OTP or PIN with anyone.
        </p>
      </div>

      {/* Right form panel */}
      <div className="flex w-full lg:w-3/5 flex-col justify-center bg-card px-8 py-10">
        {children}
      </div>
    </div>
  );
}

// ── Schemas ────────────────────────────────────────────────────────────────────
const loginFormSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});
type LoginForm = z.infer<typeof loginFormSchema>;

type LoginErrorType =
  | "user_not_found"
  | "wrong_password"
  | "reset_required"
  | null;

type ApiErrorResponse = {
  message?: string;
  code?: string;
  error?:
    | string
    | {
        code?: string;
        message?: string;
        details?: { remainingAttempts?: number };
      };
};

const MAX_PASSWORD_ATTEMPTS = 3;

// ── Component ──────────────────────────────────────────────────────────────────
export default function LoginPage() {
  const { login } = useAuth();

  // ── Screen state ──────────────────────────────────────────────
  const [screen, setScreen] = useState<"login" | "otp">("login");
  const [maskedEmail, setMaskedEmail] = useState("");

  // ── OTP state ─────────────────────────────────────────────────
  const [otpValue, setOtpValue] = useState("");
  const [otpError, setOtpError] = useState("");
  const [otpLocked, setOtpLocked] = useState(false);
  const [remainingAttempts, setRemainingAttempts] = useState<number | null>(
    null,
  );

  // ── Login state ───────────────────────────────────────────────
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState<LoginErrorType>(null);
  const [passwordAttempts, setPasswordAttempts] = useState(0);

  const {
    canResend,
    minutes,
    seconds,
    start: startOtpTimer,
  } = useOtpCountdown({
    initialSeconds: 60,
    autoStart: false,
  });

  const loginForm = useForm<LoginForm>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: { email: "", password: "" },
  });

  // ── Helpers ───────────────────────────────────────────────────
  function getErrorFields(data: ApiErrorResponse | undefined) {
    if (!data)
      return {
        code: "",
        message: "",
        error: "",
        remaining: undefined as number | undefined,
      };
    if (data.error && typeof data.error === "object") {
      return {
        code: data.error.code ?? "",
        message: data.error.message ?? "",
        error: data.error.code ?? "",
        remaining: data.error.details?.remainingAttempts,
      };
    }
    return {
      code: data.code ?? "",
      message: data.message ?? "",
      error: typeof data.error === "string" ? data.error : "",
      remaining: undefined as number | undefined,
    };
  }

  function classifyLoginError(
    data: Record<string, string> | undefined,
  ): LoginErrorType {
    if (!data) return null;
    const errorCode = (data.error ?? "").toUpperCase();
    const text = (data.message ?? data.code ?? "").toLowerCase();

    if (
      errorCode.includes("USER_NOT_FOUND") ||
      errorCode.includes("NOT_FOUND") ||
      text.includes("not found") ||
      text.includes("no user") ||
      text.includes("does not exist") ||
      text.includes("user not found")
    )
      return "user_not_found";

    if (
      errorCode.includes("WRONG_PASSWORD") ||
      errorCode.includes("INVALID_PASSWORD") ||
      errorCode.includes("INVALID_CREDENTIALS") ||
      text.includes("password") ||
      text.includes("incorrect") ||
      text.includes("invalid credentials") ||
      text.includes("wrong password")
    )
      return "wrong_password";

    return null;
  }

  // ── Mutations ─────────────────────────────────────────────────
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
      const errorType = classifyLoginError(
        fields as unknown as Record<string, string>,
      );

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
        toast.error(
          !err.response
            ? "Cannot reach WalletX API. Start the API gateway and auth service, then try again."
            : fields.message ||
                fields.code ||
                fields.error ||
                "Login failed. Please try again.",
        );
      }
    },
  });

  const otpMutation = useMutation({
    mutationFn: (otp: string) =>
      authApi.verifyLoginOtp({ email: pendingEmail.get(), otp }),
    onSuccess: async (res: any) => {
      const data = res.data?.data;
      pendingEmail.clear();
      toast.success(`Welcome back, ${data?.user?.fullName ?? ""}!`);
      await login();
    },
    onError: (err: AxiosError<ApiErrorResponse>) => {
      const errObj = err.response?.data?.error;
      const code = typeof errObj === "object" ? (errObj?.code ?? "") : "";
      const remaining =
        typeof errObj === "object"
          ? errObj?.details?.remainingAttempts
          : undefined;

      if (code === "OTP_LOCKED" || code === "MAX_ATTEMPTS_EXCEEDED") {
        setOtpLocked(true);
        setOtpError("");
        setRemainingAttempts(null);
      } else if (code === "INVALID_OTP") {
        setRemainingAttempts(remaining ?? null);
        setOtpError("wrong");
        setOtpValue("");
      } else {
        const fields = getErrorFields(err.response?.data);
        setOtpError(fields.message || "Invalid code. Please try again.");
        setOtpValue("");
      }
    },
  });

  const resendMutation = useMutation({
    mutationFn: () => authApi.resendLoginOtp(pendingEmail.get()),
    onSuccess: () => {
      startOtpTimer();
      setOtpValue("");
      setOtpError("");
      setOtpLocked(false);
      setRemainingAttempts(null);
      toast.success("New code sent to your email");
    },
    onError: (err: AxiosError<ApiErrorResponse>) => {
      const fields = getErrorFields(err.response?.data);
      toast.error(fields.message || "Failed to resend code");
    },
  });

  function quickLogin(account: { email: string; password: string }) {
    loginForm.setValue("email", account.email, { shouldValidate: true });
    loginForm.setValue("password", account.password, { shouldValidate: true });
    setLoginError(null);
  }

  // ── OTP Screen ────────────────────────────────────────────────
  if (screen === "otp") {
    return (
      <LoginShell>
        <div className="mb-1 flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            type="button"
            onClick={() => {
              setScreen("login");
              setOtpValue("");
              setOtpError("");
              setOtpLocked(false);
              setRemainingAttempts(null);
            }}
            className="h-8 gap-1.5 px-2 text-muted-foreground hover:text-foreground"
            aria-label="Back to login"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="text-sm">Back to login</span>
          </Button>
        </div>

        <div className="mt-5 mb-6">
          <p className="text-xs font-semibold uppercase tracking-widest text-accent mb-1">
            New device detected
          </p>
          <h2 className="text-[22px] font-extrabold tracking-tight text-foreground text-balance">
            Validate your login
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {"Enter the 6-digit OTP sent to "}
            <span className="font-semibold text-foreground">{maskedEmail}</span>
          </p>
        </div>

        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-3">
            <p className="text-sm font-medium text-foreground text-center">
              Enter OTP
            </p>

            <OtpSlotInput
              length={6}
              autoFocus
              disabled={otpLocked || otpMutation.isPending}
              value={otpValue}
              onChange={(val) => {
                setOtpValue(val);
                setOtpError("");
              }}
              onComplete={(val) => {
                if (!otpLocked) otpMutation.mutate(val);
              }}
            />

            {/* Verifying spinner */}
            {otpMutation.isPending && (
              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Verifying…
              </div>
            )}

            {/* Locked banner */}
            {otpLocked && (
              <Alert variant="destructive">
                <AlertTitle className="text-sm font-bold">
                  🔒 Too many attempts
                </AlertTitle>
                <AlertDescription className="text-xs mt-0.5">
                  Try again after 30 minutes or resend a new OTP.
                </AlertDescription>
              </Alert>
            )}

            {/* Wrong OTP + remaining attempts */}
            {!otpLocked && otpError === "wrong" && (
              <Alert variant="destructive">
                <AlertTitle className="text-sm font-semibold">
                  Incorrect OTP
                </AlertTitle>
                {remainingAttempts !== null && (
                  <AlertDescription className="text-xs mt-0.5">
                    ⚠️ {remainingAttempts} attempt
                    {remainingAttempts === 1 ? "" : "s"} remaining
                  </AlertDescription>
                )}
              </Alert>
            )}

            {/* Generic error */}
            {!otpLocked && otpError && otpError !== "wrong" && (
              <Alert variant="destructive">
                <AlertDescription className="text-xs font-medium">
                  {otpError}
                </AlertDescription>
              </Alert>
            )}
          </div>

          <p className="text-center text-sm text-muted-foreground">
            {canResend ? (
              <button
                type="button"
                disabled={resendMutation.isPending}
                className="text-accent font-medium hover:underline"
                onClick={() => resendMutation.mutate()}
              >
                {resendMutation.isPending ? (
                  <>
                    <Loader2 className="inline h-3.5 w-3.5 animate-spin mr-1" />
                    Sending...
                  </>
                ) : (
                  "Resend OTP"
                )}
              </button>
            ) : (
              <>
                Resend OTP in{" "}
                <span className="font-mono font-bold text-foreground">
                  {String(minutes).padStart(2, "0")}:
                  {String(seconds).padStart(2, "0")}
                </span>
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

  // ── Login Screen ──────────────────────────────────────────────
  return (
    <LoginShell>
      <div className="mb-6">
        <p className="text-xs font-semibold uppercase tracking-widest text-accent mb-1">
          Sign In
        </p>
        <h2 className="text-[22px] font-extrabold tracking-tight text-foreground text-balance">
          Welcome back
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Sign in to your WalletX account
        </p>
      </div>

      {/* Test accounts */}
      <Card className="mb-5 border-dashed bg-muted/30 py-3.5 gap-2.5 shadow-none">
        <CardHeader className="p-0 px-3.5 pb-0">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Test Accounts
            </CardTitle>
            <Badge variant="outline" className="text-[10px] py-0 font-normal">
              Quick Login
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-0 px-3.5 flex flex-col gap-1.5">
          {TEST_ACCOUNT_ITEMS.map((acc) => (
            <Button
              key={acc.id}
              variant="outline"
              type="button"
              onClick={() => quickLogin(acc)}
              className="h-auto w-full justify-start gap-2.5 p-2 bg-card hover:bg-accent/5 hover:border-accent/40 font-normal text-left"
            >
              <div
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${acc.color}`}
              >
                <acc.icon className="h-3.5 w-3.5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-medium text-foreground">
                  {acc.label}
                </p>
                <p className="truncate text-[11px] text-muted-foreground">
                  {acc.email}
                </p>
              </div>
            </Button>
          ))}
        </CardContent>
        <CardFooter className="p-0 px-3.5 pt-1 flex flex-col gap-1 text-center text-[11px] text-muted-foreground">
          <p>
            Password:{" "}
            <span className="font-mono font-medium text-foreground">
              Vikram12@
            </span>
          </p>
          <p>
            OTP:{" "}
            <span className="font-mono font-medium text-foreground">0000</span>
            {" • "}
            PIN:{" "}
            <span className="font-mono font-medium text-foreground">1234</span>
          </p>
        </CardFooter>
      </Card>

      <div className="flex flex-col gap-4">
        {loginError === "user_not_found" && (
          <Alert variant="destructive">
            <UserX className="h-4 w-4" />
            <AlertTitle>No account found</AlertTitle>
            <AlertDescription className="text-xs mt-0.5">
              <Link
                href="/auth/register"
                className="font-semibold underline underline-offset-2"
              >
                Sign up instead
              </Link>
              .
            </AlertDescription>
          </Alert>
        )}

        {loginError === "wrong_password" && (
          <Alert
            variant="destructive"
            className="border-warning/30 bg-warning/5 text-warning-foreground [&>svg]:text-warning-foreground"
          >
            <KeyRound className="h-4 w-4" />
            <AlertTitle>Incorrect password</AlertTitle>
            <AlertDescription className="text-xs mt-0.5 opacity-90">
              Please double-check and try again.
            </AlertDescription>
          </Alert>
        )}

        {loginError === "reset_required" && (
          <Alert variant="destructive">
            <RotateCcw className="h-4 w-4" />
            <AlertTitle>Too many failed attempts</AlertTitle>
            <AlertDescription className="text-xs mt-0.5">
              <Link
                href="/auth/forgot-password"
                className="font-semibold underline underline-offset-2"
              >
                Reset your password
              </Link>{" "}
              to regain access.
            </AlertDescription>
          </Alert>
        )}

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="email">Email address</Label>
          <Input
            id="email"
            type="email"
            placeholder="you@example.com"
            className={
              loginForm.formState.errors.email ? "border-destructive" : ""
            }
            {...loginForm.register("email", {
              onChange: () => {
                if (loginError === "user_not_found") {
                  setLoginError(null);
                  loginForm.clearErrors("email");
                }
              },
            })}
          />
          {loginForm.formState.errors.email && (
            <p className="text-xs text-destructive">
              {loginForm.formState.errors.email.message}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Password</Label>
            <Link
              href="/auth/forgot-password"
              className={`text-xs transition-colors hover:underline ${loginError === "reset_required" ? "font-semibold text-destructive" : "text-accent"}`}
            >
              {loginError === "reset_required"
                ? "Reset password"
                : "Forgot password?"}
            </Link>
          </div>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              className={
                loginForm.formState.errors.password
                  ? "border-destructive pr-10"
                  : "pr-10"
              }
              {...loginForm.register("password", {
                onChange: () => {
                  if (
                    loginError === "wrong_password" ||
                    loginError === "reset_required"
                  ) {
                    setLoginError(null);
                    loginForm.clearErrors("password");
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
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
          {loginForm.formState.errors.password && (
            <p className="text-xs text-destructive">
              {loginForm.formState.errors.password.message}
            </p>
          )}
        </div>

        <Button
          type="button"
          disabled={loginMutation.isPending || loginError === "reset_required"}
          className="mt-1 w-full bg-accent text-accent-foreground hover:bg-accent/90 font-semibold tracking-wide disabled:opacity-60"
          onClick={() =>
            loginForm.handleSubmit((d) => loginMutation.mutate(d))()
          }
        >
          {loginMutation.isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Signing in...
            </>
          ) : loginError === "reset_required" ? (
            "Sign in disabled — reset password first"
          ) : (
            "SIGN IN"
          )}
        </Button>
      </div>

      <p className="mt-5 text-center text-sm text-muted-foreground">
        {"Don't have an account? "}
        <Link
          href="/auth/register"
          className="font-semibold text-accent hover:underline"
        >
          Create one
        </Link>
      </p>
    </LoginShell>
  );
}
