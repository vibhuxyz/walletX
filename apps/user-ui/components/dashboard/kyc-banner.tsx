"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ShieldAlert, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export function KycBanner() {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="relative overflow-hidden rounded-2xl bg-primary p-6 md:p-8"
    >
      <div className="absolute -right-8 -top-8 h-40 w-40 rounded-full bg-primary-foreground/5" />
      <div className="absolute -bottom-12 -left-12 h-48 w-48 rounded-full bg-primary-foreground/5" />
      <div className="relative z-10 flex flex-col items-start gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary-foreground/10">
            <ShieldAlert className="h-6 w-6 text-primary-foreground" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-primary-foreground">
              Your wallet is not active
            </h3>
            <p className="mt-1 text-sm text-primary-foreground/70">
              Complete your KYC verification to activate your wallet and start
              sending money.
            </p>
          </div>
        </div>
        <Button
          asChild
          className="shrink-0 bg-primary-foreground text-primary hover:bg-primary-foreground/90 font-semibold"
        >
          <Link href="/private/kyc">
            Complete KYC
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </div>
    </motion.div>
  );
}
