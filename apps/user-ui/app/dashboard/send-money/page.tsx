"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useMemo, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { Badge } from "@/components/ui/badge";
import { KycGate } from "@/components/shared/kyc-gate";
import { formatCurrency, getInitials, formatDate } from "@/lib/constants";
import {
  Send,
  Search,
  ArrowRight,
  CheckCircle2,
  Loader2,
  Wallet,
  ArrowUpRight,
  Lock,
  X,
  Users,
  IndianRupee,
} from "lucide-react";

import {
  useWalletBalance,
  useRecentTransactions,
  useRecentRecipients,
  qk,
  type Recipient,
} from "@/lib/wallet/useWalletQuery";
import {
  apiValidateTransfer,
  apiConfirmTransfer,
  getApiError,
  type ValidateResponse,
} from "@/lib/api/transfer";
import type { LedgerEntry } from "@/lib/api/ledgerApi";

function SendMoneyContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();

  const { data: balanceData } = useWalletBalance();
  const { data: recentTransactions = [] } = useRecentTransactions(10);
  const { data: recentRecipients = [] } = useRecentRecipients();

  const [step, setStep] = useState<"details" | "pin" | "success">("details");
  const [paymentSource, setPaymentSource] = useState<"wallet" | string>(
    "wallet",
  );

  const [selectedContact, setSelectedContact] = useState<Recipient | null>(
    null,
  );
  const [recipientEmail, setRecipientEmail] = useState(
    searchParams.get("email") || "",
  );
  const [recipientName, setRecipientName] = useState("");
  const [amount, setAmount] = useState(searchParams.get("amount") || "");
  const [note, setNote] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [pin, setPin] = useState("");

  const [loading, setLoading] = useState(false);
  const [validationData, setValidationData] = useState<ValidateResponse | null>(
    null,
  );

  const filteredContacts = useMemo(() => {
    if (!searchQuery) return recentRecipients;
    const q = searchQuery.toLowerCase();
    return recentRecipients.filter(
      (c) =>
        c.name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q),
    );
  }, [searchQuery, recentRecipients]);

  // Filter to show only sent transactions P2P_SEND
  const sentTransactions = useMemo(() => {
    return recentTransactions.filter(
      (tx: LedgerEntry) => tx.type === "P2P_SEND",
    );
  }, [recentTransactions]);

  function handleSelectContact(contact: Recipient) {
    setSelectedContact(contact);
    setRecipientEmail(contact.email);
    setRecipientName(contact.name);
    setSearchQuery("");
  }

  function handleClearRecipient() {
    setSelectedContact(null);
    setRecipientEmail("");
    setRecipientName("");
    setSearchQuery("");
  }

  async function handleProceed() {
    if (!recipientEmail || !amount || parseFloat(amount) <= 0) return;

    setLoading(true);
    try {
      const data = await apiValidateTransfer(recipientEmail, amount, note);
      setValidationData(data);
      setRecipientName(data.recipient.name);
      setStep("pin");
    } catch (err) {
      toast.error(getApiError(err));
    } finally {
      setLoading(false);
    }
  }

  function handlePinConfirm() {
    if (pin.length < 4) return;
    handleSend();
  }

  async function handleSend() {
    if (!validationData) return;
    setLoading(true);
    try {
      await apiConfirmTransfer(validationData.transferId, pin);
      queryClient.invalidateQueries({ queryKey: qk.balance });
      queryClient.invalidateQueries({ queryKey: qk.dashboardSummary });
      queryClient.invalidateQueries({ queryKey: qk.recentTransactionsRoot });
      queryClient.invalidateQueries({ queryKey: qk.ledgerRoot });
      setStep("success");
      toast.success(`${formatCurrency(parseFloat(amount))} sent successfully!`);
    } catch (err) {
      toast.error(getApiError(err));
      setPin("");
    } finally {
      setLoading(false);
    }
  }

  if (step === "success") {
    return (
      <div className="mx-auto max-w-lg">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
        >
          <Card className="border-border/30 bg-card text-center">
            <CardContent className="py-12">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
                className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10"
              >
                <CheckCircle2 className="h-10 w-10 text-primary" />
              </motion.div>
              <h2 className="text-2xl font-bold text-foreground">
                Transfer Successful!
              </h2>
              <p className="mt-2 text-muted-foreground">
                {formatCurrency(parseFloat(amount))} has been sent to{" "}
                <span className="font-medium text-foreground">
                  {recipientName || recipientEmail}
                </span>
              </p>
              <div className="mt-6 rounded-2xl bg-secondary/50 p-5">
                <div className="flex flex-col gap-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">To</span>
                    <span className="font-medium text-foreground">
                      {recipientEmail}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Amount</span>
                    <span className="font-bold text-primary">
                      {formatCurrency(parseFloat(amount))}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">From</span>
                    <span className="font-medium text-foreground">
                      Wallet Balance
                    </span>
                  </div>
                  {note && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Note</span>
                      <span className="font-medium text-foreground">
                        {note}
                      </span>
                    </div>
                  )}
                </div>
              </div>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
                <Button
                  onClick={() => router.push("/dashboard")}
                  className="bg-primary text-primary-foreground hover:bg-primary/90 font-semibold"
                >
                  Back to Dashboard
                </Button>
                <Button
                  variant="outline"
                  className="border-border/40 bg-secondary/50 text-foreground hover:bg-secondary"
                  onClick={() => {
                    setStep("details");
                    setSelectedContact(null);
                    setRecipientEmail("");
                    setRecipientName("");
                    setAmount("");
                    setNote("");
                    setPin("");
                    setValidationData(null);
                  }}
                >
                  Send another
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  if (step === "pin") {
    return (
      <div className="mx-auto max-w-xl pt-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="border-gray-200 shadow-sm rounded-3xl bg-white p-6">
            <CardHeader className="text-center pb-2 pt-6">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center">
                <Lock className="h-8 w-8 text-[#25d366]" strokeWidth={2} />
              </div>
              <CardTitle className="text-xl font-bold text-[#373d48]">
                Enter Wallet PIN
              </CardTitle>
              <CardDescription className="text-[15px] text-[#5d7079] mt-2">
                Enter your 4-digit PIN to authorize this transfer of{" "}
                <span className="font-bold text-[#25d366]">
                  {formatCurrency(parseFloat(amount))}
                </span>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center gap-8 py-6">
                <InputOTP maxLength={4} value={pin} onChange={setPin}>
                  <InputOTPGroup className="gap-4">
                    <InputOTPSlot
                      index={0}
                      className="h-16 w-14 rounded-xl border-gray-200 bg-white text-2xl font-bold text-[#373d48] shadow-sm focus:ring-[#25d366]"
                    />
                    <InputOTPSlot
                      index={1}
                      className="h-16 w-14 rounded-xl border-gray-200 bg-white text-2xl font-bold text-[#373d48] shadow-sm focus:ring-[#25d366]"
                    />
                    <InputOTPSlot
                      index={2}
                      className="h-16 w-14 rounded-xl border-gray-200 bg-white text-2xl font-bold text-[#373d48] shadow-sm focus:ring-[#25d366]"
                    />
                    <InputOTPSlot
                      index={3}
                      className="h-16 w-14 rounded-xl border-gray-200 bg-white text-2xl font-bold text-[#373d48] shadow-sm focus:ring-[#25d366]"
                    />
                  </InputOTPGroup>
                </InputOTP>

                <div className="flex items-center gap-6 mt-4">
                  <button
                    onClick={() => {
                      setStep("details");
                      setPin("");
                    }}
                    className="text-[15px] font-bold text-[#373d48] hover:text-gray-600 transition-colors bg-transparent border-none"
                  >
                    Back
                  </button>
                  <Button
                    onClick={handlePinConfirm}
                    disabled={pin.length < 4 || loading}
                    className="bg-[#25d366] text-white hover:bg-[#20bd5b] font-bold rounded-full h-12 px-8 text-[15px] min-w-[160px]"
                  >
                    {loading ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      "Confirm & Send"
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="mx-auto max-w-5xl"
    >
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Send Money</h1>
        <p className="text-sm text-muted-foreground">
          Transfer money to anyone using their email address
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        {/* Main form */}
        <div className="flex flex-col gap-5 lg:col-span-3">
          {/* Payment source */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
          >
            <Card className="border-border/30 bg-card">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm text-muted-foreground font-semibold">
                  Pay From
                </CardTitle>
              </CardHeader>
              <CardContent>
                <button
                  onClick={() => setPaymentSource("wallet")}
                  className={`flex w-full items-center gap-3 rounded-xl border-2 p-3 text-left transition-all ${
                    paymentSource === "wallet"
                      ? "border-primary bg-primary/5"
                      : "border-transparent bg-secondary/30 hover:bg-secondary/50"
                  }`}
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/15">
                    <Wallet className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-foreground">
                      Wallet Balance
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {balanceData?.availableBalance || "..."} available
                    </p>
                  </div>
                  {paymentSource === "wallet" && (
                    <div className="h-3 w-3 rounded-full bg-primary" />
                  )}
                </button>
              </CardContent>
            </Card>
          </motion.div>

          {/* Recipient */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="border-border/30 bg-card">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Users className="h-4 w-4 text-primary" />
                  Recipient
                </CardTitle>
              </CardHeader>
              <CardContent>
                {selectedContact ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex items-center gap-3 rounded-xl border border-primary/30 bg-primary/5 p-3"
                  >
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={selectedContact.avatar || undefined} />
                      <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">
                        {getInitials(selectedContact.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-foreground">
                        {selectedContact.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {selectedContact.email}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-foreground"
                      onClick={handleClearRecipient}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </motion.div>
                ) : (
                  <div className="flex flex-col gap-3">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        placeholder="Search by name or email..."
                        className="pl-10 bg-secondary/50 border-border/30"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>

                    <AnimatePresence>
                      {searchQuery && filteredContacts.length > 0 && (
                        <motion.div
                          initial={{ opacity: 0, y: -4 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -4 }}
                          className="rounded-xl border border-border/30 bg-secondary/30 overflow-hidden max-h-48 overflow-y-auto"
                        >
                          {filteredContacts.map((contact) => (
                            <button
                              key={contact.email}
                              onClick={() => handleSelectContact(contact)}
                              className="flex w-full items-center gap-3 p-3 text-left transition-colors hover:bg-secondary/50 border-b border-border/20 last:border-0"
                            >
                              <Avatar className="h-8 w-8">
                                <AvatarImage
                                  src={contact.avatar || undefined}
                                />
                                <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                                  {getInitials(contact.name)}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="text-sm font-semibold text-foreground">
                                  {contact.name}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {contact.email}
                                </p>
                              </div>
                            </button>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <div className="relative flex items-center gap-2">
                      <div className="flex-1 border-t border-border/30" />
                      <span className="text-xs text-muted-foreground">
                        or enter email directly
                      </span>
                      <div className="flex-1 border-t border-border/30" />
                    </div>

                    <Input
                      type="email"
                      placeholder="recipient@email.com"
                      value={recipientEmail}
                      onChange={(e) => setRecipientEmail(e.target.value)}
                      className="bg-secondary/50 border-border/30 focus:border-primary/50"
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Amount + Note */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
          >
            <Card className="border-border/30 bg-card">
              <CardContent className="flex flex-col gap-4 p-6">
                <div className="flex flex-col gap-2">
                  <Label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                    Amount
                  </Label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-bold text-muted-foreground">
                      <IndianRupee />
                    </span>
                    <Input
                      type="number"
                      placeholder="0.00"
                      className="pl-10 text-2xl font-bold bg-secondary/50 border-border/30 h-14"
                      min="0.01"
                      step="0.01"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    PIN verification required for all wallet payments
                  </p>
                </div>
                <div className="flex flex-col gap-2">
                  <Label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                    Note (optional)
                  </Label>
                  <Textarea
                    placeholder="What's this for?"
                    rows={2}
                    value={note}
                    className="bg-secondary/50 border-border/30"
                    onChange={(e) => setNote(e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Button
              size="lg"
              onClick={handleProceed}
              disabled={
                !recipientEmail || !amount || parseFloat(amount) <= 0 || loading
              }
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-semibold text-base h-12"
            >
              {loading ? (
                <Loader2 className="animate-spin" />
              ) : (
                <>
                  Continue to Verify PIN <ArrowRight className="ml-2 h-5 w-5" />
                </>
              )}
            </Button>
          </motion.div>
        </div>

        {/* Recent transfers sidebar */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.25 }}
          className="lg:col-span-2"
        >
          <Card className="border-border/30 bg-card">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm text-muted-foreground font-semibold">
                  Recent Transfers
                </CardTitle>
                <Badge
                  variant="secondary"
                  className="text-[10px] bg-secondary text-muted-foreground border-0"
                >
                  {sentTransactions.length} transfers
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-0.5 max-h-[500px] overflow-y-auto pr-1">
                {sentTransactions.length === 0 && (
                  <div className="flex flex-col items-center gap-2 py-8 text-center">
                    <Send className="h-6 w-6 text-muted-foreground/30" />
                    <p className="text-xs text-muted-foreground">
                      No recent transfers
                    </p>
                  </div>
                )}
                {sentTransactions.map((tx: LedgerEntry, i) => {
                  //  Get recipient info from ledger entry
                  const recipientEmail = tx.recipient?.email || "";
                  const recipientName = tx.recipient?.name || tx.subtitle;

                  // Clean amount no prefix needed for display
                  const cleanAmount = tx.amount;

                  return (
                    <motion.button
                      key={tx.transactionId}
                      type="button"
                      onClick={() => {
                        if (recipientEmail) {
                          setRecipientEmail(recipientEmail);
                          setRecipientName(recipientName);
                          setSelectedContact(null);
                          setSearchQuery("");
                        }
                      }}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.3 + i * 0.03 }}
                      className="flex items-center gap-3 rounded-xl px-2 py-2.5 text-left transition-colors hover:bg-secondary/40"
                    >
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-secondary text-muted-foreground">
                        <ArrowUpRight className="h-4 w-4" />
                      </div>
                      <div className="flex-1 overflow-hidden">
                        <p className="truncate text-xs font-semibold text-foreground">
                          {tx.title}
                        </p>
                        <p className="text-[10px] text-muted-foreground">
                          {formatDate(tx.createdAt)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-bold text-foreground">
                          -₹{cleanAmount}
                        </p>
                        <Badge
                          variant="secondary"
                          className={`text-[8px] uppercase h-4
                            ${tx.status === "SUCCESS" ? "bg-green-500/10 text-green-600" : ""}
                            ${tx.status === "PENDING" ? "bg-yellow-500/10 text-yellow-600" : ""}
                            ${tx.status === "FAILED" ? "bg-red-500/10 text-red-600" : ""}
                          `}
                        >
                          {tx.status}
                        </Badge>
                      </div>
                    </motion.button>
                  );
                })}
              </div>

              {/* Quick contacts */}
              <div className="mt-4 border-t border-border/20 pt-4">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-2">
                  Quick Send
                </p>
                <div className="flex flex-wrap gap-2">
                  {recentRecipients.slice(0, 5).map((contact) => (
                    <button
                      key={contact.email}
                      type="button"
                      onClick={() => handleSelectContact(contact)}
                      className="flex flex-col items-center gap-1 rounded-xl p-2 transition-colors hover:bg-secondary/50"
                    >
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={contact.avatar || undefined} />
                        <AvatarFallback className="bg-primary/10 text-primary text-[10px] font-semibold">
                          {getInitials(contact.name)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-[9px] text-muted-foreground max-w-[48px] truncate">
                        {contact.name.split(" ")[0]}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
}

export default function SendMoneyPage() {
  return (
    <KycGate featureName="Send Money">
      <Suspense>
        <SendMoneyContent />
      </Suspense>
    </KycGate>
  );
}
