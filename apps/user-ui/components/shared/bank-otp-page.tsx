"use client"

import { useState, useEffect, useCallback } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp"
import { Loader2, Landmark, ShieldCheck } from "lucide-react"

interface BankOtpPageProps {
  bankName: string
  bankLogo?: string
  cardType?: string
  maskedAccountNumber: string
  maskedPhone?: string
  merchantName?: string
  amount: number
  currency?: string
  onConfirm: () => void
  onCancel: () => void
}

export function BankOtpPage({
  bankName,
  bankLogo,
  cardType = "Account",
  maskedAccountNumber,
  maskedPhone = "+1 (XXX) XXX-X567",
  merchantName = "WalletX",
  amount,
  currency = "INR",
  onConfirm,
  onCancel,
}: BankOtpPageProps) {
  const [otp, setOtp] = useState("")
  const [loading, setLoading] = useState(false)
  const [timer, setTimer] = useState(120)
  const [canResend, setCanResend] = useState(false)

  useEffect(() => {
    const generatedOtp = Math.floor(100000 + Math.random() * 900000)
    console.log(`[v0] Bank OTP for ${bankName} (${maskedAccountNumber}): ${generatedOtp}`)
  }, [bankName, maskedAccountNumber])

  useEffect(() => {
    if (timer <= 0) {
      setCanResend(true)
      return
    }
    const interval = setInterval(() => setTimer((t) => t - 1), 1000)
    return () => clearInterval(interval)
  }, [timer])

  const handleResend = useCallback(() => {
    const newOtp = Math.floor(100000 + Math.random() * 900000)
    console.log(`[v0] Resent Bank OTP for ${bankName}: ${newOtp}`)
    setTimer(120)
    setCanResend(false)
    setOtp("")
  }, [bankName])

  function handleConfirm() {
    if (otp.length < 6) return
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      onConfirm()
    }, 1500)
  }

  const mins = Math.floor(timer / 60)
  const secs = timer % 60

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="mx-auto max-w-md"
    >
      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-lg">
        {/* Bank Header */}
        <div className="flex items-center justify-between bg-primary px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-foreground/20 font-bold text-primary-foreground text-sm">
              {bankLogo || bankName.charAt(0)}
            </div>
            <span className="font-bold text-primary-foreground">{bankName}</span>
          </div>
          <div className="flex items-center gap-1.5 rounded-md bg-primary-foreground/15 px-2.5 py-1 text-xs font-medium text-primary-foreground">
            <ShieldCheck className="h-3.5 w-3.5" />
            Secure
          </div>
        </div>

        {/* Transaction Details */}
        <div className="border-b border-border bg-muted/30 px-6 py-4">
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">{cardType}</span>
              <span className="font-mono font-medium text-foreground">{maskedAccountNumber}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Mobile Number</span>
              <span className="font-mono text-foreground">{maskedPhone}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Merchant Name</span>
              <span className="font-medium text-foreground">{merchantName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Amount</span>
              <span className="font-bold text-foreground">
                {currency} {amount.toLocaleString("en-US", { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>
        </div>

        {/* OTP Section */}
        <div className="px-6 py-6">
          <div className="mb-1 flex items-center gap-2">
            <Landmark className="h-4 w-4 text-primary" />
            <h3 className="font-bold text-foreground">OTP Authentication</h3>
          </div>
          <p className="mb-5 text-xs leading-relaxed text-muted-foreground">
            An OTP (One Time Password) has been sent to your registered mobile
            number. Please authenticate the transaction using OTP.
          </p>

          <div className="mb-5 flex justify-center">
            <InputOTP
              maxLength={6}
              value={otp}
              onChange={setOtp}
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

          <div className="mb-5 flex gap-3">
            <Button
              onClick={handleConfirm}
              disabled={otp.length < 6 || loading}
              className="flex-1 rounded-lg"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Verifying...
                </>
              ) : (
                "Confirm"
              )}
            </Button>
            <Button
              variant="outline"
              onClick={onCancel}
              disabled={loading}
              className="flex-1 rounded-lg"
            >
              Cancel
            </Button>
          </div>

          <div className="text-center">
            {canResend ? (
              <button
                onClick={handleResend}
                className="text-sm font-semibold text-primary hover:underline"
              >
                RESEND OTP
              </button>
            ) : (
              <p className="text-xs text-muted-foreground">
                {"Didn't receive OTP?"}{" "}
                <span className="font-medium text-foreground">
                  Resend in {mins}:{secs.toString().padStart(2, "0")}
                </span>
              </p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-border bg-muted/30 px-6 py-3">
          <p className="text-center text-[10px] leading-relaxed text-muted-foreground">
            OTPs are SECRET. DO NOT disclose it to anyone. {bankName} NEVER asks for OTP.
            This page will automatically timeout after {mins}:{secs.toString().padStart(2, "0")}.
          </p>
        </div>
      </div>
    </motion.div>
  )
}
