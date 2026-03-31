import { Currency } from "./currency.js";

export function formatLedgerEntry(entry: any, userId: string) {
  const isIncoming = entry.amount > 0;
  const isWithdrawal =
    entry.entryType === "ADMIN_ADJUSTMENT" &&
    entry.metadata?.kind === "WITHDRAWAL";

  // Request-paid entries are terminal once persisted; older rows may still be
  // marked PENDING due to previous default-status bug, so normalize to SUCCESS.
  const status =
    entry.entryType === "PAYMENT_REQUEST_PAID" && entry.status === "PENDING"
      ? "SUCCESS"
      : entry.status || "SUCCESS";

  // ✅ FIX: Get absolute value of BigInt (can't use Math.abs on BigInt!)
  const absoluteAmount = entry.amount < 0n ? -entry.amount : entry.amount;

  // Helper to get title
  const getTitle = (): string => {
    switch (entry.entryType) {
      case "WALLET_TOPUP":
        return "Wallet Top-up";
      case "P2P_SEND":
        return entry.relatedUser?.fullName
          ? `Send to ${entry.relatedUser.fullName}`
          : "Send Money";
      case "P2P_RECEIVE":
        return entry.relatedUser?.fullName
          ? `Received from ${entry.relatedUser.fullName}`
          : "Received Money";
      case "MERCHANT_PAYMENT":
        return entry.merchant?.businessName
          ? `Paid to ${entry.merchant.businessName}`
          : "Merchant Payment";
      case "MERCHANT_REFUND":
        return entry.merchant?.businessName
          ? `Refund from ${entry.merchant.businessName}`
          : "Refund Received";
      case "PAYMENT_REQUEST_PAID":
        return entry.relatedUser?.fullName
          ? `Request paid to ${entry.relatedUser.fullName}`
          : "Request Paid";
      case "ADMIN_ADJUSTMENT":
        return isWithdrawal ? "Wallet Withdrawal" : "Admin Adjustment";
      default:
        return "Transaction";
    }
  };

  // Helper to get subtitle
  const getSubtitle = (): string => {
    if (entry.relatedUser) {
      return entry.relatedUser.fullName;
    }
    if (entry.merchant) {
      return entry.merchant.businessName;
    }
    if (isWithdrawal && entry.metadata?.bankName) {
      return `${entry.metadata.bankName} (${entry.metadata.maskedAccount ?? "Bank"})`;
    }
    return entry.description;
  };

  // Helper to get icon
  const getIcon = (): string => {
    switch (entry.entryType) {
      case "WALLET_TOPUP":
        return "wallet";
      case "P2P_SEND":
        return "send";
      case "P2P_RECEIVE":
        return "receive";
      case "MERCHANT_PAYMENT":
        return "shopping";
      case "MERCHANT_REFUND":
        return "refund";
      case "PAYMENT_REQUEST_PAID":
        return "request";
      case "ADMIN_ADJUSTMENT":
        return isWithdrawal ? "withdrawal" : "admin";
      default:
        return "transaction";
    }
  };

  // Helper to get category
  const getCategory = (): string => {
    switch (entry.entryType) {
      case "WALLET_TOPUP":
        return "topup";
      case "P2P_SEND":
      case "P2P_RECEIVE":
        return "p2p";
      case "MERCHANT_PAYMENT":
      case "MERCHANT_REFUND":
        return "merchant";
      case "PAYMENT_REQUEST_PAID":
        return "request";
      case "ADMIN_ADJUSTMENT":
        return isWithdrawal ? "withdrawal" : "admin";
      default:
        return "other";
    }
  };

  // Build the response
  const formatted: any = {
    transactionId: entry.id,
    referenceId: entry.referenceId,
    type: entry.entryType,
    // ✅ FIX: Use absoluteAmount instead of Math.abs(entry.amount)
    amount: Currency.toRupees(absoluteAmount),
    balanceBefore: Currency.toRupees(entry.balanceBefore),
    balanceAfter: Currency.toRupees(entry.balanceAfter),
    description: entry.description,
    isIncoming,
    createdAt: entry.createdAt,

    // ✅ Use actual status from database column
    status: status,

    title: getTitle(),
    subtitle: getSubtitle(),
    icon: getIcon(),
    category: getCategory(),

    // Notes from database
    note: entry.notes,

    // Failure info from notes or metadata
    failureReason: entry.notes || entry.metadata?.failureReason,
  };

  // Add related user info
  if (entry.relatedUser) {
    if (entry.entryType === "P2P_SEND") {
      formatted.recipient = {
        id: entry.relatedUser.id,
        name: entry.relatedUser.fullName,
        email: entry.relatedUser.email,
        phone: entry.relatedUser.phone,
        avatar: entry.relatedUser.kycProfile?.selfieUrl ?? null,
      };
    } else if (entry.entryType === "P2P_RECEIVE") {
      formatted.sender = {
        id: entry.relatedUser.id,
        name: entry.relatedUser.fullName,
        email: entry.relatedUser.email,
        phone: entry.relatedUser.phone,
        avatar: entry.relatedUser.kycProfile?.selfieUrl ?? null,
      };
    }
  }

  // Add merchant info
  if (entry.merchant) {
    formatted.merchant = {
      id: entry.merchant.id,
      businessName: entry.merchant.businessName,
      businessType: entry.merchant.businessType,
    };
  }

  // Add bank details for topups
  if (entry.entryType === "WALLET_TOPUP" && entry.metadata) {
    if (entry.metadata.bankName && entry.metadata.maskedAccount) {
      formatted.bankDetails = {
        bankName: entry.metadata.bankName,
        accountNumber: entry.metadata.maskedAccount,
      };
    }
  }

  if (
    isWithdrawal &&
    entry.metadata?.bankName &&
    entry.metadata?.maskedAccount
  ) {
    formatted.bankDetails = {
      bankName: entry.metadata.bankName,
      accountNumber: entry.metadata.maskedAccount,
    };
  }

  // Add order ID if present
  if (entry.orderId) {
    formatted.orderId = entry.orderId;
  }

  // Add metadata (for additional info, but NOT for status!)
  formatted.metadata = entry.metadata;

  return formatted;
}
