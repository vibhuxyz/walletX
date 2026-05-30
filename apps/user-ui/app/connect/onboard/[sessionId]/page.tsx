"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  ArrowRight,
  CheckCircle2,
  Loader2,
  LockKeyhole,
  ShieldCheck,
  Wallet,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/lib/auth-context";
import { useCurrentUser } from "@/lib/wallet/useWalletQuery";
import {
  completeConnectSession,
  getConnectSession,
} from "@/lib/api/connectApi";

export default function ConnectOnboardingPage() {
  const params = useParams<{ sessionId: string }>();
  const router = useRouter();
  const sessionId = params.sessionId;
  const returnPath = `/connect/onboard/${sessionId}`;
  const { auth } = useAuth();
  const { data: user } = useCurrentUser(true);

  const sessionQuery = useQuery({
    queryKey: ["connect-session", sessionId],
    queryFn: () => getConnectSession(sessionId),
    enabled: Boolean(sessionId),
    retry: false,
  });

  const completeMutation = useMutation({
    mutationFn: () => completeConnectSession(sessionId),
    onSuccess: (data) => {
      toast.success("Wallet linked");
      window.location.href = data.redirectUrl;
    },
    onError: (error: any) => {
      const code = error.response?.data?.error?.code;
      if (code === "PIN_REQUIRED") {
        router.push("/auth/create-pin");
        return;
      }
      if (code === "KYC_REQUIRED") {
        router.push("/auth/kyc");
        return;
      }
      toast.error(
        error.response?.data?.error?.message ??
          error.response?.data?.message ??
          "Unable to link wallet",
      );
    },
  });

  const session = sessionQuery.data;
  const isExpired =
    session?.status === "EXPIRED" ||
    (session?.expiresAt ? new Date(session.expiresAt) <= new Date() : false);
  const emailMatches =
    Boolean(auth.email && session?.email) &&
    auth.email.toLowerCase() === session!.email.toLowerCase();
  const walletActive = user?.wallet?.status === "ACTIVE";
  const pinPending = user?.wallet?.status === "PENDING_PIN";

  return (
    <main className="flex min-h-screen items-center justify-center bg-white px-4 py-10">
      <div className="w-full max-w-xl">
        <div className="mb-6 flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent text-accent-foreground">
            <Wallet className="h-4 w-4" />
          </div>
          <div>
            <p className="text-sm font-bold">WalletX Connect</p>
            <p className="text-xs text-muted-foreground">
              Hosted wallet onboarding
            </p>
          </div>
        </div>

        <Card className="border-border/60 shadow-lg shadow-accent/5">
          <CardHeader>
            <div className="mb-3 flex items-center justify-between gap-3">
              <Badge variant="secondary" className="gap-1.5">
                <LockKeyhole className="h-3.5 w-3.5" />
                Secure Link
              </Badge>
              {session?.status && <Badge>{session.status}</Badge>}
            </div>
            <CardTitle className="text-2xl">
              Activate WalletX for {session?.partner?.name ?? "partner app"}
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-5">
            {sessionQuery.isLoading && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading session...
              </div>
            )}

            {sessionQuery.isError && (
              <StatusBlock
                title="Session unavailable"
                description="Ask the partner app to start wallet activation again."
              />
            )}

            {session && (
              <>
                <div className="rounded-lg border border-border/70 bg-muted/30 p-4 text-sm">
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-muted-foreground">Partner email</span>
                    <span className="font-semibold">{session.email}</span>
                  </div>
                  <div className="mt-2 flex items-center justify-between gap-4">
                    <span className="text-muted-foreground">WalletX account</span>
                    <span className="font-semibold">
                      {auth.isAuthenticated ? auth.email : "Not signed in"}
                    </span>
                  </div>
                </div>

                {isExpired && (
                  <StatusBlock
                    title="Session expired"
                    description="Return to the partner app and click Activate Wallet again."
                  />
                )}

                {!isExpired && !auth.isAuthenticated && (
                  <div className="space-y-3">
                    <p className="text-sm text-muted-foreground">
                      Sign in or create a WalletX account with the same email as
                      the partner account.
                    </p>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <Button asChild>
                        <Link
                          href="/auth/login"
                          onClick={() =>
                            sessionStorage.setItem(
                              "postAuthRedirect",
                              returnPath,
                            )
                          }
                        >
                          Sign in
                        </Link>
                      </Button>
                      <Button variant="outline" asChild>
                        <Link
                          href="/auth/register"
                          onClick={() =>
                            sessionStorage.setItem(
                              "postAuthRedirect",
                              returnPath,
                            )
                          }
                        >
                          Create account
                        </Link>
                      </Button>
                    </div>
                  </div>
                )}

                {!isExpired && auth.isAuthenticated && !emailMatches && (
                  <StatusBlock
                    title="Email mismatch"
                    description="Sign in to WalletX using the same email shown on the partner account."
                  />
                )}

                {!isExpired && auth.isAuthenticated && emailMatches && (
                  <div className="space-y-4">
                    <div className="flex items-start gap-3 rounded-lg border border-success/20 bg-success/5 p-4">
                      <ShieldCheck className="mt-0.5 h-5 w-5 text-success" />
                      <div>
                        <p className="text-sm font-semibold">
                          Email verified for account linking
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          The partner app can read balance and request wallet
                          holds after you approve.
                        </p>
                      </div>
                    </div>

                    {pinPending && (
                      <Button className="w-full" asChild>
                        <Link href="/auth/create-pin">
                          Create PIN
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                      </Button>
                    )}

                    {!pinPending && !walletActive && (
                      <Button className="w-full" asChild>
                        <Link href="/auth/kyc">
                          Complete KYC
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                      </Button>
                    )}

                    {walletActive && (
                      <Button
                        className="w-full"
                        disabled={completeMutation.isPending}
                        onClick={() => completeMutation.mutate()}
                      >
                        {completeMutation.isPending ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Linking wallet...
                          </>
                        ) : (
                          <>
                            <CheckCircle2 className="mr-2 h-4 w-4" />
                            Approve and continue
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}

function StatusBlock({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-4">
      <p className="text-sm font-semibold text-destructive">{title}</p>
      <p className="mt-1 text-sm text-muted-foreground">{description}</p>
    </div>
  );
}
