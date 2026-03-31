"use client";

import { useRouter } from "next/navigation";
import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Loader2, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useQueryClient } from "@tanstack/react-query";

// ✅ Correct Import: Hooks are usually in the query file
import { qk, useRecentRecipients } from "@/lib/wallet/useWalletQuery";

// ✅ Correct Import: API logic in the api file
import {
  apiValidateTransfer,
  apiConfirmTransfer,
  getApiError,
  PIN_THRESHOLD,
  type ValidateResponse,
} from "@/lib/api/transfer";

// Helper for Initials (e.g., "Vikram Kumar" -> "VK")
function getInitials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join("");
}

export function QuickTransfer() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const amountInputRef = useRef<HTMLInputElement>(null); // Ref to auto-focus amount

  // Fetch recent recipients from the hook we created
  const { data: recentRecipients = [], isLoading: loadingRecipients } =
    useRecentRecipients();

  const [email, setEmail] = useState("");
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState<ValidateResponse | null>(null);

  const parsedAmount = parseFloat(amount) || 0;
  const likelyNeedsPin = parsedAmount > PIN_THRESHOLD;

  // UX Handler: Select user and focus amount
  const handleSelectRecipient = (recipientEmail: string) => {
    setEmail(recipientEmail);
    // Small delay to allow state update, then focus the amount field for speed
    setTimeout(() => amountInputRef.current?.focus(), 100);
  };

  async function handleTransfer(e: React.FormEvent) {
    e.preventDefault();
    if (!email || parsedAmount <= 0) return;

    setLoading(true);
    try {
      // 1. Validate (Check balance, user existence)
      const validated = await apiValidateTransfer(email, amount);

      // 2. If amount > ₹500, redirect to full page for PIN
      if (validated.requiresPin) {
        router.push(
          `/dashboard/send-money?email=${encodeURIComponent(email)}&amount=${parsedAmount}`,
        );
        return;
      }

      // 3. If small amount, confirm instantly
      await apiConfirmTransfer(validated.transferId);

      // 4. Refresh Data
      queryClient.invalidateQueries({ queryKey: qk.balance });
      queryClient.invalidateQueries({ queryKey: qk.dashboardSummary });
      queryClient.invalidateQueries({ queryKey: qk.recentTransactionsRoot });
      queryClient.invalidateQueries({ queryKey: qk.ledgerRoot });
      queryClient.invalidateQueries({ queryKey: qk.walletTransactionsRoot });

      setDone(validated);
      toast.success(`₹${validated.transaction.amount} sent successfully!`);
    } catch (err) {
      toast.error(getApiError(err));
    } finally {
      setLoading(false);
    }
  }

  function reset() {
    setDone(null);
    setEmail("");
    setAmount("");
  }

  // ── Success View ──────────────────────────────────────────────────────────
  if (done) {
    return (
      <Card className="border-border/30 bg-card">
        <CardContent className="flex flex-col items-center gap-4 py-10 text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200 }}
            className="flex h-16 w-16 items-center justify-center rounded-full bg-green-500/10"
          >
            <CheckCircle2 className="h-8 w-8 text-green-600" />
          </motion.div>
          <div>
            <p className="text-lg font-bold text-foreground">
              Transfer Successful!
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Sent{" "}
              <span className="font-semibold text-foreground">
                ₹{done.transaction.amount}
              </span>{" "}
              to{" "}
              <span className="font-semibold text-foreground">
                {done.recipient.name}
              </span>
            </p>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={reset}
            className="mt-2 border-border/40 bg-secondary/50 hover:bg-secondary"
          >
            Make another transfer
          </Button>
        </CardContent>
      </Card>
    );
  }

  // ── Main Form View ────────────────────────────────────────────────────────
  return (
    <Card className="border-border/30 bg-card">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Send className="h-4 w-4 text-primary" />
          Quick Transfer
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Recent Recipients List */}
        <div className="mb-6">
          <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Recent Recipients
          </p>

          {loadingRecipients ? (
            <div className="flex gap-4 overflow-hidden pb-2">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex flex-col items-center gap-2">
                  <div className="h-11 w-11 rounded-full skeleton-shimmer" />
                  <div className="h-2 w-12 rounded skeleton-shimmer" />
                </div>
              ))}
            </div>
          ) : recentRecipients.length === 0 ? (
            <p className="text-xs text-muted-foreground py-2">
              No recent transactions found.
            </p>
          ) : (
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
              {recentRecipients.map((r, i) => {
                const isSelected = email === r.email;
                return (
                  <motion.button
                    key={r.email}
                    type="button"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.05 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleSelectRecipient(r.email)}
                    className={`flex flex-col items-center gap-1.5 min-w-[60px] transition-all ${
                      isSelected
                        ? "opacity-100 scale-105"
                        : "opacity-60 hover:opacity-100"
                    }`}
                  >
                    <Avatar
                      className={`h-11 w-11 border-2 transition-all ${
                        isSelected
                          ? "border-primary shadow-md shadow-primary/20"
                          : "border-transparent"
                      }`}
                    >
                      {r.avatar && <AvatarImage src={r.avatar} alt={r.name} />}
                      <AvatarFallback className="bg-primary/10 text-primary text-[10px] font-bold">
                        {getInitials(r.name)}
                      </AvatarFallback>
                    </Avatar>
                    <span
                      className={`w-16 truncate text-center text-[10px] font-medium transition-colors ${
                        isSelected ? "text-primary" : "text-muted-foreground"
                      }`}
                    >
                      {r.name.split(" ")[0]}
                    </span>
                  </motion.button>
                );
              })}
            </div>
          )}
        </div>

        {/* Form Inputs */}
        <form onSubmit={handleTransfer} className="flex flex-col gap-4">
          <div className="grid gap-4">
            <div className="space-y-2">
              <Label
                htmlFor="qt-email"
                className="text-xs font-medium text-muted-foreground"
              >
                Recipient Email
              </Label>
              <Input
                id="qt-email"
                type="email"
                placeholder="user@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-secondary/50 border-border/30"
                required
              />
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="qt-amount"
                className="text-xs font-medium text-muted-foreground"
              >
                Amount (INR)
              </Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                  ₹
                </span>
                <Input
                  ref={amountInputRef}
                  id="qt-amount"
                  type="number"
                  placeholder="0.00"
                  min="1"
                  step="1"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="pl-7 bg-secondary/50 border-border/30"
                  required
                />
              </div>

              {/* Dynamic Helper Text */}
              <AnimatePresence>
                {parsedAmount > PIN_THRESHOLD && (
                  <motion.p
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="text-[11px] text-amber-500 font-medium pt-1"
                  >
                    ⚠️ Transfers over ₹{PIN_THRESHOLD} require PIN verification.
                  </motion.p>
                )}
              </AnimatePresence>
            </div>
          </div>

          <Button
            type="submit"
            disabled={loading || !email || parsedAmount <= 0}
            className="w-full bg-primary font-semibold text-primary-foreground hover:bg-primary/90"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : likelyNeedsPin ? (
              "Proceed to Verify"
            ) : (
              "Pay Now"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
