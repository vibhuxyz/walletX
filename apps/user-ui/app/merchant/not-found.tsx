"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Store,
  ArrowLeft,
  QrCode,
  BarChart3,
  Wallet,
  RefreshCcw,
  ShieldCheck,
  Zap,
  Bell,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

// ─────────────────────────────────────────────────────
// Place at: app/dashboard/merchant/not-found.tsx
// Catches ALL unmatched routes under /dashboard/merchant/*
// ─────────────────────────────────────────────────────

const FEATURES = [
  {
    icon: QrCode,
    title: "Payment QR Codes",
    desc: "Accept payments from any FineWallet user instantly with dynamic QR codes.",
  },
  {
    icon: BarChart3,
    title: "Sales Analytics",
    desc: "Real-time revenue dashboards with peak hours and customer insights.",
  },
  {
    icon: Wallet,
    title: "Instant Settlements",
    desc: "Daily settlements straight to your linked bank account. No waiting.",
  },
  {
    icon: RefreshCcw,
    title: "Refund Management",
    desc: "Issue full or partial refunds with a single tap, no back and forth.",
  },
  {
    icon: ShieldCheck,
    title: "Fraud Protection",
    desc: "AI-powered monitoring guards every transaction automatically.",
  },
  {
    icon: Zap,
    title: "Instant Alerts",
    desc: "Real-time push and SMS notifications the moment a payment lands.",
  },
];

export default function MerchantNotFound() {
  const router = useRouter();

  return (
    <div className="relative min-h-screen w-full bg-white flex flex-col">
      {/* ── Subtle top accent bar ── */}
      <div className="h-1 w-full bg-[#25d366]" />

      {/* ── Main content ── */}
      <div className="flex flex-1 flex-col items-center justify-center px-6 py-20">
        <div className="w-full max-w-3xl flex flex-col items-center gap-12">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
          >
            <Badge
              variant="outline"
              className="gap-2 border-[#25d366]/40 bg-[#f0fdf4] text-[#16a34a] py-1.5 px-4 text-[11px] font-bold uppercase tracking-widest rounded-full"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#25d366] opacity-60" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-[#25d366]" />
              </span>
              Under Active Development
            </Badge>
          </motion.div>

          {/* Icon + headline */}
          <div className="flex flex-col items-center gap-7 text-center">
            <motion.div
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{
                delay: 0.1,
                type: "spring",
                stiffness: 180,
                damping: 14,
              }}
              className="relative"
            >
              {/* Outer ring */}
              <div className="absolute -inset-3 rounded-[32px] border-2 border-dashed border-[#25d366]/25 animate-[spin_20s_linear_infinite]" />
              <div className="flex h-24 w-24 items-center justify-center rounded-[24px] bg-[#f0fdf4] border border-[#25d366]/30 shadow-sm">
                <Store className="h-11 w-11 text-[#25d366]" strokeWidth={1.5} />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="flex flex-col gap-4"
            >
              <h1 className="text-5xl font-black tracking-tighter text-[#0f1c17] sm:text-6xl lg:text-7xl leading-[1.0]">
                MERCHANT
                <br />
                <span className="text-[#25d366]">COMING SOON</span>
              </h1>
              <p className="mx-auto max-w-[460px] text-base leading-relaxed text-[#5a7a6a]">
                We're building a world-class merchant experience for FineWallet
                — accept payments, track every rupee, and grow your business
                from one powerful dashboard.
              </p>
            </motion.div>
          </div>

          {/* Divider */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.45 }}
            className="flex w-full items-center gap-4"
          >
            <Separator className="flex-1 bg-gray-100" />
            <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-gray-400 whitespace-nowrap">
              What We're Building
            </span>
            <Separator className="flex-1 bg-gray-100" />
          </motion.div>

          {/* Feature grid */}
          <div className="grid w-full grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map(({ icon: Icon, title, desc }, i) => (
              <motion.div
                key={title}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.52 + i * 0.07, duration: 0.4 }}
                whileHover={{ y: -3, transition: { duration: 0.15 } }}
                className="group flex flex-col gap-3 rounded-2xl border border-gray-100 bg-gray-50/70 p-5 hover:border-[#25d366]/30 hover:bg-[#f0fdf4]/60 transition-all duration-250 cursor-default"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white border border-gray-200 group-hover:border-[#25d366]/30 group-hover:bg-[#f0fdf4] transition-colors shadow-sm">
                  <Icon
                    className="h-[18px] w-[18px] text-[#25d366]"
                    strokeWidth={1.8}
                  />
                </div>
                <div>
                  <p className="text-[13px] font-bold text-[#0f1c17]">
                    {title}
                  </p>
                  <p className="mt-1 text-[12px] leading-relaxed text-gray-500">
                    {desc}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.0 }}
            className="flex flex-col items-center gap-3 sm:flex-row"
          >
            <Button
              variant="outline"
              onClick={() => router.push("/")}
              className="group gap-2 rounded-full border-gray-200 text-gray-600 hover:border-gray-300 hover:text-gray-900 px-6 h-11"
            >
              <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
              Back to Home
            </Button>

            <Button
              onClick={() =>
                alert("You'll be notified when the Merchant Portal goes live!")
              }
              className="gap-2 rounded-full bg-[#25d366] text-white font-bold hover:bg-[#20bd5b] shadow-md hover:shadow-[0_6px_24px_rgba(37,211,102,0.35)] active:scale-95 transition-all px-8 h-11"
            >
              <Bell className="h-4 w-4" />
              Notify Me at Launch
            </Button>
          </motion.div>

          {/* Footer note */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
            className="text-[11px] text-gray-400"
          >
            Questions about merchant access?{" "}
            <a
              href="mailto:merchant-support@finewallet.in"
              className="text-[#25d366] hover:underline underline-offset-2 transition-colors"
            >
              merchant-support@finewallet.in
            </a>
          </motion.p>
        </div>
      </div>

      {/* ── Bottom bar ── */}
      <div className="border-t border-gray-100 py-4 text-center">
        <p className="text-[11px] font-medium tracking-widest uppercase text-gray-300">
          Error · Merchant Portal · FineWallet
        </p>
      </div>
    </div>
  );
}
