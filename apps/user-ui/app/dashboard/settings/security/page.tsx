"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Shield, Smartphone, Key, Lock, Loader2 } from "lucide-react";
import { authApi } from "@/lib/api/auth";
import { useCurrentUser } from "@/lib/wallet/useWalletQuery";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { useOtpCountdown } from "@/lib/utils/use-otp-countdown";

type ApiErrorResponse = {
  message?: string;
  code?: string;
  error?:
    | string
    | {
        code?: string;
        message?: string;
        details?: { retryAfterSeconds?: number };
      };
};

function getErrorMessage(data: ApiErrorResponse | undefined, fallback: string) {
  if (!data) return fallback;
  if (data.error && typeof data.error === "object") {
    return data.error.message || data.error.code || fallback;
  }
  return data.message || data.code || fallback;
}

function formatRetryAfter(seconds: number) {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.ceil((seconds % 3600) / 60);
  if (hrs <= 0) return `${mins} min`;
  if (mins <= 0) return `${hrs} hr`;
  return `${hrs} hr ${mins} min`;
}

export default function SettingsSecurityPage() {
  const { data: user } = useCurrentUser();
  const hasPin = user?.wallet?.status
    ? user.wallet.status !== "PENDING_PIN"
    : false;

  const [showChangePin, setShowChangePin] = useState(false);
  const [currentPin, setCurrentPin] = useState("");
  const [newPin, setNewPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");

  const [showResetPin, setShowResetPin] = useState(false);
  const [otp, setOtp] = useState("");
  const [resetPin, setResetPin] = useState("");
  const [confirmResetPin, setConfirmResetPin] = useState("");
  const { countdown, canResend, start: startOtpTimer } = useOtpCountdown({
    initialSeconds: 60,
    autoStart: false,
  });

  const changePinMutation = useMutation({
    mutationFn: () =>
      authApi.changePin({
        currentPin,
        newPin,
        confirmNewPin: confirmPin,
      }),
    onSuccess: () => {
      toast.success("Wallet PIN changed successfully");
      setShowChangePin(false);
      setCurrentPin("");
      setNewPin("");
      setConfirmPin("");
    },
    onError: (err: AxiosError<ApiErrorResponse>) => {
      const data = err.response?.data;
      const errorObj =
        data?.error && typeof data.error === "object" ? data.error : null;
      const retryAfter = errorObj?.details?.retryAfterSeconds;
      if (errorObj?.code === "PIN_CHANGE_COOLDOWN" && retryAfter) {
        toast.error(
          `PIN can be changed once every 7 days. Try again in ${formatRetryAfter(retryAfter)}.`,
        );
        return;
      }
      toast.error(getErrorMessage(data, "Failed to change PIN"));
    },
  });

  const forgotPinMutation = useMutation({
    mutationFn: () => authApi.forgotPinOtp(),
    onSuccess: () => {
      setShowResetPin(true);
      startOtpTimer();
      toast.success("PIN reset OTP sent to your email");
    },
    onError: (err: AxiosError<ApiErrorResponse>) => {
      toast.error(
        getErrorMessage(err.response?.data, "Failed to send PIN reset OTP"),
      );
    },
  });

  const resendForgotPinMutation = useMutation({
    mutationFn: () => authApi.resendForgotPinOtp(),
    onSuccess: () => {
      startOtpTimer();
      toast.success("PIN reset OTP resent");
    },
    onError: (err: AxiosError<ApiErrorResponse>) => {
      toast.error(
        getErrorMessage(err.response?.data, "Failed to resend PIN reset OTP"),
      );
    },
  });

  const resetPinMutation = useMutation({
    mutationFn: () =>
      authApi.resetPinWithOtp({
        otp,
        newPin: resetPin,
        confirmNewPin: confirmResetPin,
      }),
    onSuccess: () => {
      toast.success("PIN reset successfully");
      setShowResetPin(false);
      setOtp("");
      setResetPin("");
      setConfirmResetPin("");
    },
    onError: (err: AxiosError<ApiErrorResponse>) => {
      toast.error(getErrorMessage(err.response?.data, "Failed to reset PIN"));
    },
  });

  function handleChangePin() {
    if (
      currentPin.length !== 4 ||
      newPin.length !== 4 ||
      confirmPin.length !== 4
    ) {
      toast.error("PIN must be 4 digits");
      return;
    }
    if (newPin !== confirmPin) {
      toast.error("New PINs don't match");
      return;
    }
    if (currentPin === newPin) {
      toast.error("New PIN must be different from current PIN");
      return;
    }
    changePinMutation.mutate();
  }

  function handleResetPin() {
    if (otp.length !== 6) {
      toast.error("OTP must be 6 digits");
      return;
    }
    if (resetPin.length !== 4 || confirmResetPin.length !== 4) {
      toast.error("PIN must be 4 digits");
      return;
    }
    if (resetPin !== confirmResetPin) {
      toast.error("PINs do not match");
      return;
    }
    resetPinMutation.mutate();
  }

  return (
    <div className="flex flex-col gap-6">
      <Card className="border-border/50">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Key className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg">Wallet PIN</CardTitle>
              <CardDescription>Your 4-digit PIN for transaction security</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between rounded-lg bg-muted/50 p-4">
            <div className="flex items-center gap-3">
              <Lock className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium text-foreground">
                  {hasPin ? "PIN is set" : "PIN not set"}
                </p>
                <p className="text-xs text-muted-foreground">
                  {hasPin
                    ? "You can change or reset your PIN"
                    : "Set a PIN to secure wallet transactions"}
                </p>
              </div>
            </div>
            <Badge className={hasPin ? "bg-success/10 text-success" : ""}>
              {hasPin ? "Active" : "Pending"}
            </Badge>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {hasPin && (
              <Button
                variant="outline"
                onClick={() => {
                  setShowChangePin(!showChangePin);
                  setShowResetPin(false);
                }}
              >
                {showChangePin ? "Close change PIN" : "Change PIN"}
              </Button>
            )}
            <Button
              variant="outline"
              onClick={() => forgotPinMutation.mutate()}
              disabled={forgotPinMutation.isPending}
            >
              {forgotPinMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending OTP...
                </>
              ) : (
                "Forgot PIN (Send OTP)"
              )}
            </Button>
          </div>

          {showChangePin && (
            <div className="mt-4 flex flex-col gap-4 rounded-lg border border-border p-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="currentPin">Current PIN</Label>
                <Input
                  id="currentPin"
                  type="password"
                  maxLength={4}
                  placeholder="Enter current PIN"
                  value={currentPin}
                  onChange={(e) => setCurrentPin(e.target.value.replace(/\D/g, ""))}
                  className="max-w-48"
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="newPin">New PIN</Label>
                <Input
                  id="newPin"
                  type="password"
                  maxLength={4}
                  placeholder="Enter new PIN"
                  value={newPin}
                  onChange={(e) => setNewPin(e.target.value.replace(/\D/g, ""))}
                  className="max-w-48"
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="confirmPin">Confirm New PIN</Label>
                <Input
                  id="confirmPin"
                  type="password"
                  maxLength={4}
                  placeholder="Confirm new PIN"
                  value={confirmPin}
                  onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, ""))}
                  className="max-w-48"
                />
              </div>
              <div className="flex gap-3">
                <Button
                  onClick={handleChangePin}
                  className="bg-primary text-primary-foreground"
                  disabled={changePinMutation.isPending}
                >
                  {changePinMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    "Update PIN"
                  )}
                </Button>
                <Button variant="ghost" onClick={() => setShowChangePin(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {showResetPin && (
            <div className="mt-4 flex flex-col gap-4 rounded-lg border border-border p-4">
              <div className="flex flex-col gap-2">
                <Label>OTP</Label>
                <InputOTP
                  maxLength={6}
                  value={otp}
                  onChange={(value) => setOtp(value.replace(/\D/g, ""))}
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
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="resetPin">New PIN</Label>
                <Input
                  id="resetPin"
                  type="password"
                  maxLength={4}
                  placeholder="Enter new PIN"
                  value={resetPin}
                  onChange={(e) => setResetPin(e.target.value.replace(/\D/g, ""))}
                  className="max-w-48"
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="confirmResetPin">Confirm New PIN</Label>
                <Input
                  id="confirmResetPin"
                  type="password"
                  maxLength={4}
                  placeholder="Confirm new PIN"
                  value={confirmResetPin}
                  onChange={(e) =>
                    setConfirmResetPin(e.target.value.replace(/\D/g, ""))
                  }
                  className="max-w-48"
                />
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <Button
                  onClick={handleResetPin}
                  className="bg-primary text-primary-foreground"
                  disabled={resetPinMutation.isPending}
                >
                  {resetPinMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Resetting...
                    </>
                  ) : (
                    "Reset PIN"
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => resendForgotPinMutation.mutate()}
                  disabled={!canResend || resendForgotPinMutation.isPending}
                >
                  {resendForgotPinMutation.isPending
                    ? "Resending..."
                    : canResend
                      ? "Resend OTP"
                      : `Resend OTP in ${countdown}s`}
                </Button>
                <Button variant="ghost" onClick={() => setShowResetPin(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="border-border/50">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Smartphone className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg">Two-Factor Authentication</CardTitle>
              <CardDescription>Add an extra layer of security to your account</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between rounded-lg bg-muted/50 p-4">
            <div>
              <p className="text-sm font-medium text-foreground">Email OTP Verification</p>
              <p className="text-xs text-muted-foreground">
                OTP is required for sensitive account operations
              </p>
            </div>
            <Badge className="bg-success/10 text-success">Enabled</Badge>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/50">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Shield className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg">Active Sessions</CardTitle>
              <CardDescription>Manage your logged-in devices</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {[
            { device: "Current Device", location: "Detected from browser", current: true },
          ].map((session) => (
            <div key={session.device} className="flex items-center justify-between rounded-lg bg-muted/50 p-4">
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium text-foreground">{session.device}</p>
                  {session.current && (
                    <Badge variant="secondary" className="text-xs">Current</Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">{session.location}</p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
