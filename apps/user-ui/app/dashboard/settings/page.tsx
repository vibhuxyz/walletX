"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { getInitials } from "@/lib/constants";
import { toast } from "sonner";
import { Camera, CheckCircle, Clock3, Loader2 } from "lucide-react";
import { useCurrentUser } from "@/lib/wallet/useWalletQuery";
import { authApi } from "@/lib/api/auth";
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
    | { code?: string; message?: string; details?: { currentBalance?: string } };
};

function getErrorMessage(data: ApiErrorResponse | undefined, fallback: string) {
  if (!data) return fallback;
  if (data.error && typeof data.error === "object") {
    return data.error.message || data.error.code || fallback;
  }
  return data.message || data.code || fallback;
}

function getErrorCode(data: ApiErrorResponse | undefined) {
  if (!data) return "";
  if (data.error && typeof data.error === "object") {
    return data.error.code ?? "";
  }
  if (typeof data.error === "string") {
    return data.error;
  }
  return data.code ?? "";
}

export default function SettingsGeneralPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: user, isLoading } = useCurrentUser();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [showDeleteOtpForm, setShowDeleteOtpForm] = useState(false);
  const [deleteOtp, setDeleteOtp] = useState("");
  const {
    countdown: deleteOtpCountdown,
    canResend: canResendDeleteOtp,
    start: startDeleteOtpTimer,
    reset: resetDeleteOtpTimer,
  } = useOtpCountdown({
    initialSeconds: 60,
    autoStart: false,
  });

  useEffect(() => {
    if (!user) return;
    setName(user.fullName || "");
    setPhone(user.phone || "");
  }, [user]);

  const memberSince = useMemo(() => {
    if (!user?.createdAt) return "-";
    return new Date(user.createdAt).toLocaleDateString(undefined, {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }, [user?.createdAt]);

  const isKycVerified = user?.wallet?.status === "ACTIVE";

  const requestDeleteOtpMutation = useMutation({
    mutationFn: () => authApi.requestDeleteAccountOtp(),
    onSuccess: () => {
      setShowDeleteOtpForm(true);
      setDeleteOtp("");
      startDeleteOtpTimer();
      toast.success("Delete account OTP sent to your email");
    },
    onError: (err: AxiosError<ApiErrorResponse>) => {
      const data = err.response?.data;
      const code = getErrorCode(data);
      if (code === "WALLET_BALANCE_NOT_ZERO") {
        const currentBalance =
          data?.error && typeof data.error === "object"
            ? data.error.details?.currentBalance
            : undefined;
        toast.error(
          currentBalance
            ? `Please withdraw ₹${currentBalance} before deleting account.`
            : "Please withdraw wallet balance before deleting account.",
        );
        router.push("/dashboard/withdraw");
        return;
      }
      toast.error(getErrorMessage(data, "Failed to send delete OTP"));
    },
  });

  const resendDeleteOtpMutation = useMutation({
    mutationFn: () => authApi.resendDeleteAccountOtp(),
    onSuccess: () => {
      startDeleteOtpTimer();
      toast.success("Delete account OTP resent");
    },
    onError: (err: AxiosError<ApiErrorResponse>) => {
      toast.error(
        getErrorMessage(err.response?.data, "Failed to resend delete OTP"),
      );
    },
  });

  const confirmDeleteAccountMutation = useMutation({
    mutationFn: () => authApi.confirmDeleteAccountOtp(deleteOtp),
    onSuccess: () => {
      queryClient.clear();
      toast.success("Account deleted successfully");
      router.replace("/auth/login");
    },
    onError: (err: AxiosError<ApiErrorResponse>) => {
      toast.error(getErrorMessage(err.response?.data, "Failed to delete account"));
    },
  });

  if (isLoading || !user) {
    return (
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="text-lg">Profile Information</CardTitle>
          <CardDescription>Loading your account details...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="text-lg">Profile Information</CardTitle>
          <CardDescription>View your personal account details</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-6">
          <div className="flex items-center gap-4">
            <div className="relative">
              <Avatar className="h-20 w-20">
                {user.kycProfile?.selfieUrl && (
                  <AvatarImage
                    src={user.kycProfile.selfieUrl}
                    alt={user.fullName}
                    className="object-cover"
                  />
                )}
                <AvatarFallback className="bg-primary text-primary-foreground text-xl">
                  {getInitials(user.fullName)}
                </AvatarFallback>
              </Avatar>
              <button
                className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full bg-card border border-border shadow-sm hover:bg-muted transition-colors"
                aria-label="Change avatar"
                onClick={() =>
                  toast.info("Profile photo update endpoint is not added yet")
                }
              >
                <Camera className="h-3.5 w-3.5 text-muted-foreground" />
              </button>
            </div>
            <div>
              <p className="font-semibold text-foreground">{user.fullName}</p>
              <p className="text-sm text-muted-foreground">{user.email}</p>
              <div className="mt-1 flex items-center gap-1.5">
                {isKycVerified ? (
                  <Badge variant="secondary" className="gap-1 bg-success/10 text-success text-xs">
                    <CheckCircle className="h-3 w-3" />
                    KYC Verified
                  </Badge>
                ) : (
                  <Badge variant="secondary" className="gap-1 text-xs">
                    <Clock3 className="h-3 w-3" />
                    KYC Pending
                  </Badge>
                )}
              </div>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-2">
              <Label htmlFor="name">Full Name</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="email">Email Address</Label>
              <Input id="email" value={user.email} disabled className="bg-muted" />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="joined">Member Since</Label>
              <Input id="joined" value={memberSince} disabled className="bg-muted" />
            </div>
          </div>

          <div className="flex justify-end">
            <Button
              onClick={() =>
                toast.info("Profile update API is not implemented yet in backend")
              }
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              Save Changes
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="text-lg">Preferences</CardTitle>
          <CardDescription>Customize your wallet experience</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-2">
              <Label htmlFor="currency">Default Currency</Label>
              <Input id="currency" value="INR" disabled className="bg-muted" />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="language">Language</Label>
              <Input id="language" value="English" disabled className="bg-muted" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-destructive/20">
        <CardHeader>
          <CardTitle className="text-lg text-destructive">Danger Zone</CardTitle>
          <CardDescription>Irreversible and destructive actions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 rounded-lg border border-destructive/20 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-foreground">Delete Account</p>
                <p className="text-sm text-muted-foreground">
                  Permanently delete your wallet and all associated data
                </p>
              </div>
              <Button
                variant="outline"
                className="border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
                disabled={requestDeleteOtpMutation.isPending}
                onClick={() => requestDeleteOtpMutation.mutate()}
              >
                {requestDeleteOtpMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending OTP...
                  </>
                ) : (
                  "Delete"
                )}
              </Button>
            </div>

            {showDeleteOtpForm && (
              <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4">
                <p className="mb-3 text-sm text-destructive">
                  Enter the 6-digit OTP sent to your email to confirm account deletion.
                </p>
                <div className="mb-4">
                  <InputOTP
                    maxLength={6}
                    value={deleteOtp}
                    onChange={(value) => setDeleteOtp(value.replace(/\D/g, ""))}
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
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="destructive"
                    disabled={
                      confirmDeleteAccountMutation.isPending || deleteOtp.length !== 6
                    }
                    onClick={() => confirmDeleteAccountMutation.mutate()}
                  >
                    {confirmDeleteAccountMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Deleting...
                      </>
                    ) : (
                      "Confirm Delete"
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    disabled={
                      !canResendDeleteOtp || resendDeleteOtpMutation.isPending
                    }
                    onClick={() => resendDeleteOtpMutation.mutate()}
                  >
                    {resendDeleteOtpMutation.isPending
                      ? "Resending..."
                      : canResendDeleteOtp
                        ? "Resend OTP"
                        : `Resend OTP in ${deleteOtpCountdown}s`}
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => {
                      setShowDeleteOtpForm(false);
                      setDeleteOtp("");
                      resetDeleteOtpTimer();
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
