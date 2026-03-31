"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  ShieldAlert,
  ArrowRight,
  Lock,
  Send,
  Landmark,
  ArrowDownToLine,
  DollarSign,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-context";

interface KycGateProps {
  children: React.ReactNode;
  featureName: string;
}

const restrictedFeatures = [
  { icon: Send, label: "Send Money" },
  { icon: Landmark, label: "Add Bank Account" },
  { icon: ArrowDownToLine, label: "Top Up Wallet" },
  { icon: DollarSign, label: "Request Money" },
];

export function KycGate({ children, featureName }: KycGateProps) {
  const { auth } = useAuth();

  // 1. Show loader while fetching user status
  if (auth.isLoading) {
    return (
      <div className="flex h-64 w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // 2. Grant access if KYC is verified
  if (auth.kycComplete) {
    return <>{children}</>;
  }

  // 3. Restrict access (Gate)
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-auto max-w-lg py-12"
    >
      <div className="flex flex-col items-center gap-6 rounded-2xl border border-destructive/20 bg-card p-8 text-center shadow-sm">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
          <ShieldAlert className="h-8 w-8 text-destructive" />
        </div>

        <div className="flex items-center gap-2 rounded-full bg-destructive/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-destructive">
          <Lock className="h-3.5 w-3.5" />
          <span>Account Restricted</span>
        </div>

        <div>
          <h2 className="text-xl font-bold text-foreground">
            KYC Verification Required
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            Your account is currently{" "}
            {auth.isAuthenticated ? "pending verification" : "not logged in"}.
            Complete KYC verification to access{" "}
            <span className="font-medium text-foreground">{featureName}</span>{" "}
            and other wallet features.
          </p>
        </div>

        <div className="w-full rounded-xl border border-border bg-muted/30 p-4">
          <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Restricted Features
          </p>
          <div className="grid grid-cols-2 gap-2">
            {restrictedFeatures.map((feature) => (
              <div
                key={feature.label}
                className="flex items-center gap-2 rounded-lg bg-card px-3 py-2"
              >
                <feature.icon className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">
                  {feature.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        <Button asChild className="mt-2 w-full gap-2 rounded-full px-8">
          <Link href="/dashboard/kyc">
            Complete KYC Now
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>

        <Button asChild variant="ghost" size="sm">
          <Link href="/dashboard">Back to Dashboard</Link>
        </Button>

        <p className="text-xs text-muted-foreground">
          Verification usually takes under 5 minutes
        </p>
      </div>
    </motion.div>
  );
}
