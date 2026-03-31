"use client";

import {
  X,
  Copy,
  Check,
  Calendar,
  Hash,
  User,
  Mail,
  Phone,
  Building2,
  MessageSquare,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useState } from "react";
import { toast } from "sonner";
import type { LedgerEntry } from "@/lib/api/ledgerApi";
import { motion, AnimatePresence } from "framer-motion";

interface TransactionDetailsDrawerProps {
  transaction: LedgerEntry | null;
  onClose: () => void;
}

function CopyButton({ text, label }: { text: string; label: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast.success(`${label} copied!`);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy");
    }
  };

  return (
    <button
      onClick={handleCopy}
      className="ml-2 inline-flex items-center justify-center h-6 w-6 rounded-md hover:bg-muted transition-colors"
    >
      {copied ? (
        <Check className="h-3.5 w-3.5 text-green-600" />
      ) : (
        <Copy className="h-3.5 w-3.5 text-muted-foreground hover:text-foreground" />
      )}
    </button>
  );
}

export function TransactionDetailsDrawer({
  transaction,
  onClose,
}: TransactionDetailsDrawerProps) {
  if (!transaction) return null;

  const statusColor =
    transaction.status === "SUCCESS"
      ? "text-green-600 bg-green-500/10"
      : transaction.status === "FAILED"
        ? "text-red-600 bg-red-500/10"
        : "text-yellow-600 bg-yellow-500/10";

  // ✅ Amount color based on status
  const getAmountColor = () => {
    if (transaction.status === "FAILED") return "text-red-600";
    if (transaction.status === "PENDING") return "text-yellow-600";
    if (transaction.isIncoming) return "text-green-600";
    return "text-foreground";
  };

  const getAmountPrefix = () => {
    if (transaction.status === "FAILED") return "";
    if (transaction.status === "PENDING") return "";
    if (transaction.isIncoming) return "+";
    return "-";
  };

  return (
    <AnimatePresence>
      {transaction && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-50"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed right-0 top-0 bottom-0 w-full sm:w-[480px] bg-background border-l border-border z-50 overflow-y-auto"
          >
            {/* Header */}
            <div className="sticky top-0 bg-background border-b border-border p-4 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-foreground">
                  Transaction Details
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {new Date(transaction.createdAt).toLocaleString("en-IN")}
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="shrink-0"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* Status & Amount */}
              <div className="text-center py-4">
                <Badge className={`${statusColor} mb-3`}>
                  {transaction.status}
                </Badge>
                <p className={`text-3xl font-bold ${getAmountColor()}`}>
                  {getAmountPrefix()}₹{transaction.amount}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  {transaction.title}
                </p>
                <p className="text-xs text-muted-foreground">
                  {transaction.subtitle}
                </p>
              </div>

              <Separator />

              {/* Transaction Info */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-foreground">
                  Transaction Information
                </h3>

                {/* Transaction ID */}
                <div className="flex items-center justify-between py-2">
                  <span className="text-xs text-muted-foreground flex items-center gap-2">
                    <Hash className="h-3 w-3" />
                    Transaction ID
                  </span>
                  <div className="flex items-center">
                    <span className="text-sm font-mono text-foreground">
                      {transaction.transactionId.slice(-12)}
                    </span>
                    <CopyButton
                      text={transaction.transactionId}
                      label="Transaction ID"
                    />
                  </div>
                </div>

                {/* Reference ID */}
                <div className="flex items-center justify-between py-2">
                  <span className="text-xs text-muted-foreground flex items-center gap-2">
                    <Hash className="h-3 w-3" />
                    Reference ID
                  </span>
                  <div className="flex items-center">
                    <span className="text-sm font-mono text-foreground">
                      {transaction.referenceId.slice(-12)}
                    </span>
                    <CopyButton
                      text={transaction.referenceId}
                      label="Reference ID"
                    />
                  </div>
                </div>

                {/* Type */}
                <div className="flex items-center justify-between py-2">
                  <span className="text-xs text-muted-foreground">Type</span>
                  <Badge variant="outline" className="text-xs">
                    {transaction.category.toUpperCase()}
                  </Badge>
                </div>

                {/* Date */}
                <div className="flex items-center justify-between py-2">
                  <span className="text-xs text-muted-foreground flex items-center gap-2">
                    <Calendar className="h-3 w-3" />
                    Date & Time
                  </span>
                  <span className="text-sm text-foreground">
                    {new Date(transaction.createdAt).toLocaleString("en-IN", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}
                  </span>
                </div>
              </div>

              <Separator />

              {/* Balance Changes */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-foreground">
                  Balance Changes
                </h3>

                <div className="flex items-center justify-between py-2">
                  <span className="text-xs text-muted-foreground">
                    Balance Before
                  </span>
                  <span className="text-sm font-semibold text-foreground">
                    ₹{transaction.balanceBefore}
                  </span>
                </div>

                <div className="flex items-center justify-between py-2">
                  <span className="text-xs text-muted-foreground">
                    Balance After
                  </span>
                  <span className="text-sm font-semibold text-primary">
                    ₹{transaction.balanceAfter}
                  </span>
                </div>
              </div>

              {/* Sender Details */}
              {transaction.sender && (
                <>
                  <Separator />
                  <div className="space-y-3">
                    <h3 className="text-sm font-semibold text-foreground">
                      Sender Details
                    </h3>

                    <div className="flex items-center justify-between py-2">
                      <span className="text-xs text-muted-foreground flex items-center gap-2">
                        <User className="h-3 w-3" />
                        Name
                      </span>
                      <span className="text-sm font-semibold text-foreground">
                        {transaction.sender.name}
                      </span>
                    </div>

                    <div className="flex items-center justify-between py-2">
                      <span className="text-xs text-muted-foreground flex items-center gap-2">
                        <Mail className="h-3 w-3" />
                        Email
                      </span>
                      <div className="flex items-center">
                        <span className="text-sm text-foreground truncate max-w-[200px]">
                          {transaction.sender.email}
                        </span>
                        <CopyButton
                          text={transaction.sender.email}
                          label="Email"
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between py-2">
                      <span className="text-xs text-muted-foreground flex items-center gap-2">
                        <Phone className="h-3 w-3" />
                        Phone
                      </span>
                      <div className="flex items-center">
                        <span className="text-sm font-mono text-foreground">
                          {transaction.sender.phone}
                        </span>
                        <CopyButton
                          text={transaction.sender.phone}
                          label="Phone"
                        />
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* Recipient Details */}
              {transaction.recipient && (
                <>
                  <Separator />
                  <div className="space-y-3">
                    <h3 className="text-sm font-semibold text-foreground">
                      Recipient Details
                    </h3>

                    <div className="flex items-center justify-between py-2">
                      <span className="text-xs text-muted-foreground flex items-center gap-2">
                        <User className="h-3 w-3" />
                        Name
                      </span>
                      <span className="text-sm font-semibold text-foreground">
                        {transaction.recipient.name}
                      </span>
                    </div>

                    <div className="flex items-center justify-between py-2">
                      <span className="text-xs text-muted-foreground flex items-center gap-2">
                        <Mail className="h-3 w-3" />
                        Email
                      </span>
                      <div className="flex items-center">
                        <span className="text-sm text-foreground truncate max-w-[200px]">
                          {transaction.recipient.email}
                        </span>
                        <CopyButton
                          text={transaction.recipient.email}
                          label="Email"
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between py-2">
                      <span className="text-xs text-muted-foreground flex items-center gap-2">
                        <Phone className="h-3 w-3" />
                        Phone
                      </span>
                      <div className="flex items-center">
                        <span className="text-sm font-mono text-foreground">
                          {transaction.recipient.phone}
                        </span>
                        <CopyButton
                          text={transaction.recipient.phone}
                          label="Phone"
                        />
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* Bank Details */}
              {transaction.bankDetails && (
                <>
                  <Separator />
                  <div className="space-y-3">
                    <h3 className="text-sm font-semibold text-foreground">
                      Bank Details
                    </h3>

                    <div className="flex items-center justify-between py-2">
                      <span className="text-xs text-muted-foreground flex items-center gap-2">
                        <Building2 className="h-3 w-3" />
                        Bank Name
                      </span>
                      <span className="text-sm font-semibold text-foreground">
                        {transaction.bankDetails.bankName}
                      </span>
                    </div>

                    <div className="flex items-center justify-between py-2">
                      <span className="text-xs text-muted-foreground flex items-center gap-2">
                        <Hash className="h-3 w-3" />
                        Account Number
                      </span>
                      <span className="text-sm font-mono text-foreground">
                        {transaction.bankDetails.accountNumber}
                      </span>
                    </div>
                  </div>
                </>
              )}

              {/* Merchant Details */}
              {transaction.merchant && (
                <>
                  <Separator />
                  <div className="space-y-3">
                    <h3 className="text-sm font-semibold text-foreground">
                      Merchant Details
                    </h3>

                    <div className="flex items-center justify-between py-2">
                      <span className="text-xs text-muted-foreground flex items-center gap-2">
                        <Building2 className="h-3 w-3" />
                        Business Name
                      </span>
                      <span className="text-sm font-semibold text-foreground">
                        {transaction.merchant.businessName}
                      </span>
                    </div>

                    <div className="flex items-center justify-between py-2">
                      <span className="text-xs text-muted-foreground">
                        Business Type
                      </span>
                      <Badge variant="outline" className="text-xs">
                        {transaction.merchant.businessType}
                      </Badge>
                    </div>

                    {transaction.commission && (
                      <div className="flex items-center justify-between py-2">
                        <span className="text-xs text-muted-foreground">
                          Commission
                        </span>
                        <span className="text-sm text-foreground">
                          ₹{transaction.commission}
                        </span>
                      </div>
                    )}
                  </div>
                </>
              )}

              {/* Note/Reason - Only for SUCCESS or PENDING */}
              {transaction.status !== "FAILED" &&
                (transaction.note || transaction.reason) && (
                  <>
                    <Separator />
                    <div className="space-y-2">
                      <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                        <MessageSquare className="h-4 w-4" />
                        {transaction.note ? "Note" : "Reason"}
                      </h3>
                      <p className="text-sm text-muted-foreground italic bg-muted/30 p-3 rounded-lg">
                        {transaction.note || transaction.reason}
                      </p>
                    </div>
                  </>
                )}

              {/* ✅ FIXED: Failure Reason - ONLY show when status is FAILED */}
              {transaction.status === "FAILED" && transaction.failureReason && (
                <>
                  <Separator />
                  <div className="space-y-2">
                    <h3 className="text-sm font-semibold text-destructive flex items-center gap-2">
                      <AlertCircle className="h-4 w-4" />
                      Failure Reason
                    </h3>
                    <p className="text-sm text-destructive bg-destructive/10 p-3 rounded-lg">
                      {transaction.failureReason}
                    </p>
                  </div>
                </>
              )}

              {/* Description */}
              <Separator />
              <div className="space-y-2">
                <h3 className="text-sm font-semibold text-foreground">
                  Description
                </h3>
                <p className="text-sm text-muted-foreground">
                  {transaction.description}
                </p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
