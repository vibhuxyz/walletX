"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, KeyRound } from "lucide-react";
import { Button } from "@/components/ui/button";

export function PinBanner() {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="relative overflow-hidden rounded-2xl bg-amber-500 p-6 md:p-8"
    >
      <div className="absolute -right-8 -top-8 h-40 w-40 rounded-full bg-amber-100/20" />
      <div className="absolute -bottom-12 -left-12 h-48 w-48 rounded-full bg-amber-100/20" />
      <div className="relative z-10 flex flex-col items-start gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/20">
            <KeyRound className="h-6 w-6 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">Set your wallet PIN</h3>
            <p className="mt-1 text-sm text-white/85">
              You need a 4-digit PIN to secure transfers and payments.
            </p>
          </div>
        </div>
        <Button
          asChild
          className="shrink-0 bg-white text-amber-700 hover:bg-white/90 font-semibold"
        >
          <Link href="/auth/create-pin">
            Set PIN
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </div>
    </motion.div>
  );
}
