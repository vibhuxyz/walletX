"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { BankOtpPanel } from "@/components/shared/bank-otp-panel";
import { useOtpCountdown } from "@/lib/utils/use-otp-countdown";

function BankOtpContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const bankName = searchParams.get("bank") || "Chase Bank";
  const cardNumber = searchParams.get("card") || "4591 60XX XXXX 0055";
  const merchantName = searchParams.get("merchant") || "FineWallet";
  const amount = searchParams.get("amount") || "100.00";
  const returnUrl = searchParams.get("return") || "/dashboard";

  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);

  const {
    countdown,
    canResend,
    start: startCountdown,
  } = useOtpCountdown({ initialSeconds: 120 });

  function handleConfirm() {
    if (otp.length < 6) {
      toast.error("Please enter the complete 6-digit OTP");
      return;
    }

    setLoading(true);
    toast.success("OTP verified successfully!");
    router.push(returnUrl);
  }

  function handleResend() {
    startCountdown();
    toast.info("OTP has been resent to your registered mobile number");
  }

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md"
      >
        <BankOtpPanel
          meta={{
            bankName,
            maskedAccount: cardNumber,
            merchantName,
            amount: `$${amount}`,
            extraRows: [
              {
                label: "Date",
                value: new Date().toLocaleDateString("en-US", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                }),
              },
            ],
          }}
          otp={otp}
          onOtpChange={setOtp}
          onConfirm={handleConfirm}
          onCancel={() => router.back()}
          onResend={handleResend}
          countdown={countdown}
          canResend={canResend}
          isLoading={loading}
        />
      </motion.div>
    </div>
  );
}

export default function BankOtpPage() {
  return (
    <Suspense>
      <BankOtpContent />
    </Suspense>
  );
}
