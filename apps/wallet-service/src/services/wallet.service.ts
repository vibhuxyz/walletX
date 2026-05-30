import { prismaPostgres, enqueueOutboxEventTx } from "@repo/db-postgres";
import { ENV } from "@repo/config";
import {
  ApiError,
  Currency,
  ErrorCodes,
  generateTransactionId,
  Logger,
  verifyPin,
} from "@repo/libs";
import { Exchanges, RoutingKeys } from "@repo/rabbitmq";
import {
  cacheGetOrSet,
  invalidateWalletReadCaches,
  redis,
  RedisKeys,
  RedisTTL,
} from "@repo/redis";
import { getLedgerAnalytics } from "./ledger.service.js";
import { nanoid } from "nanoid";

const logger = new Logger("wallet.service");

const DEFAULT_DASHBOARD_TRANSACTION_LIMIT = 8;
const DEFAULT_DASHBOARD_RECIPIENT_LIMIT = 5;
const DEFAULT_DASHBOARD_REQUEST_LIMIT = 5;
const DEFAULT_DASHBOARD_ANALYTICS_MONTHS = 6;

function isWithdrawalEntry(entry: { entryType: string; metadata: any }) {
  return (
    entry.entryType === "ADMIN_ADJUSTMENT" &&
    (entry.metadata as any)?.kind === "WITHDRAWAL"
  );
}

function toDisplayTransaction(entry: any) {
  let title = entry.description;
  let subtitle: string = entry.entryType;
  let image: string | null = null;
  let counterpartyName: string | null = null;
  let counterpartyEmail: string | null = null;

  if (entry.entryType === "P2P_SEND" || entry.entryType === "P2P_RECEIVE") {
    if (entry.relatedUser) {
      counterpartyName = entry.relatedUser.fullName;
      counterpartyEmail = entry.relatedUser.email;
      image = entry.relatedUser.kycProfile?.selfieUrl || null;
      title =
        entry.entryType === "P2P_SEND"
          ? `Paid to ${counterpartyName}`
          : `Received from ${counterpartyName}`;
      subtitle = counterpartyEmail ?? entry.entryType;
    }
  } else if (entry.entryType === "MERCHANT_PAYMENT") {
    if (entry.merchant) {
      counterpartyName = entry.merchant.businessName;
      title = `Paid to ${counterpartyName}`;
      subtitle = "Merchant Payment";
    }
  } else if (isWithdrawalEntry(entry)) {
    title = entry.description || "Wallet withdrawal";
    subtitle = "Bank transfer";
  }

  return {
    id: entry.id,
    type: entry.entryType,
    amount: Currency.toRupees(entry.amount),
    balanceAfter: Currency.toRupees(entry.balanceAfter),
    status: entry.status,
    createdAt: entry.createdAt,
    display: {
      title,
      subtitle,
      image,
      meta: {
        counterpartyName,
        counterpartyEmail,
        transactionId: entry.referenceId,
      },
    },
  };
}

async function enqueueRealtimeWalletUpdateTx(
  tx: any,
  payload: {
    userId: string;
    balance: bigint;
    transactionId: string;
    transactionAmount: bigint;
    transactionType: string;
    transactionStatus?: "SUCCESS" | "FAILED" | "PENDING";
  },
) {
  const availableBalance = Currency.toRupees(payload.balance);

  await enqueueOutboxEventTx(tx, {
    exchange: Exchanges.REALTIME_EVENTS,
    routingKey: RoutingKeys.REALTIME_TRANSACTION,
    payload: {
      userId: payload.userId,
      transactionId: payload.transactionId,
      status: payload.transactionStatus ?? "SUCCESS",
      amount: Currency.toRupees(payload.transactionAmount),
      type: payload.transactionType,
    },
  });

  await enqueueOutboxEventTx(tx, {
    exchange: Exchanges.REALTIME_EVENTS,
    routingKey: RoutingKeys.REALTIME_BALANCE,
    payload: {
      userId: payload.userId,
      balance: availableBalance,
      availableBalance,
    },
  });
}

export const getRecentRecipients = async (
  userId: string,
  limit: number = DEFAULT_DASHBOARD_RECIPIENT_LIMIT,
) => {
  const cacheKey = RedisKeys.RECENT_RECIPIENTS(userId);

  return cacheGetOrSet(cacheKey, RedisTTL.CACHE_RECENT_RECIPIENTS, async () => {
    const transfers = await prismaPostgres.p2PTransfer.findMany({
      where: {
        senderId: userId,
        status: "SUCCESS",
      },
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      take: Math.max(limit * 4, 20),
      select: {
        id: true,
        createdAt: true,
        recipient: {
          select: {
            id: true,
            fullName: true,
            email: true,
            kycProfile: {
              select: { selfieUrl: true },
            },
          },
        },
      },
    });

    const seen = new Set<string>();
    const result: Array<{
      id: string;
      name: string;
      email: string | null;
      avatar: string | null;
      lastSentAt: Date;
    }> = [];

    for (const transfer of transfers) {
      const recipientId = transfer.recipient?.id;
      if (!recipientId || seen.has(recipientId)) {
        continue;
      }

      seen.add(recipientId);
      result.push({
        id: recipientId,
        name: transfer.recipient.fullName || "Unknown",
        email: transfer.recipient.email || null,
        avatar: transfer.recipient.kycProfile?.selfieUrl || null,
        lastSentAt: transfer.createdAt,
      });

      if (result.length >= limit) {
        break;
      }
    }

    return result;
  });
};

export interface TransactionHistoryResponse {
  transactions: Array<{
    id: string;
    entryType: string;
    amount: string;
    balanceAfter: string;
    description: string;
    createdAt: Date;
    metadata: any;
  }>;
  nextCursor?: string;
  hasMore: boolean;
}

export const getWalletBalance = async (userId: string) => {
  const cacheKey = RedisKeys.WALLET_BALANCE(userId);
  const cached = await redis.get(cacheKey);

  if (cached) {
    logger.debug("Balance cache hit", { userId });
    return JSON.parse(cached);
  }

  const wallet = await prismaPostgres.wallet.findUnique({
    where: { userId },
    select: {
      balance: true,
      status: true,
      isFrozen: true,
      updatedAt: true,
    },
  });

  if (!wallet) {
    throw new Error("Wallet not found");
  }

  const total = wallet.balance;
  const activeHolds = await (prismaPostgres as any).walletHold.aggregate({
    where: { userId, status: "ACTIVE" },
    _sum: { amount: true },
  });
  const reserved = BigInt(activeHolds._sum.amount ?? 0);
  const isLocked =
    wallet.status === "PENDING_KYC" ||
    wallet.status === "PENDING_PIN" ||
    wallet.isFrozen ||
    wallet.status === "SUSPENDED";
  const available = total - reserved;

  const result = {
    totalBalance: Currency.toRupees(total),
    availableBalance: isLocked
      ? "0.00"
      : Currency.toRupees(available > 0n ? available : 0n),
    reservedBalance: Currency.toRupees(reserved),
    currency: "INR",
    status: wallet.status,
    isFrozen: wallet.isFrozen,
    lastUpdated: wallet.updatedAt.toISOString(),
  };

  await redis.set(
    cacheKey,
    JSON.stringify(result),
    "EX",
    RedisTTL.CACHE_BALANCE,
  );

  return result;
};

// services/wallet.service.ts

export const getTransactionHistory = async (params: {
  userId: string;
  cursor?: string;
  limit?: number;
  type?: string;
  startDate?: Date;
  endDate?: Date;
}) => {
  const { userId, cursor, limit = 20, type, startDate, endDate } = params;

  const where: any = { userId };
  if (cursor) where.id = { lt: cursor };
  if (type) where.entryType = type;
  if (startDate || endDate) {
    where.createdAt = {};
    if (startDate) where.createdAt.gte = startDate;
    if (endDate) where.createdAt.lte = endDate;
  }

  const transactions = await prismaPostgres.ledgerEntry.findMany({
    where,
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    take: limit + 1,
    include: {
      relatedUser: {
        select: {
          id: true,
          fullName: true,
          email: true,
          kycProfile: {
            select: { selfieUrl: true },
          },
        },
      },
      merchant: {
        select: {
          id: true,
          businessName: true,
          merchantQrCode: true,
        },
      },
    },
  });

  const hasMore = transactions.length > limit;
  if (hasMore) transactions.pop();

  const formattedTransactions = transactions.map(toDisplayTransaction);

  return {
    transactions: formattedTransactions,
    nextCursor: transactions[transactions.length - 1]?.id,
    hasMore,
  };
};

export const getDashboard = async (userId: string) => {
  const cacheKey = RedisKeys.DASHBOARD_SUMMARY(userId);

  return cacheGetOrSet(cacheKey, RedisTTL.CACHE_DASHBOARD_SUMMARY, async () => {
    const [
      user,
      wallet,
      transactionsResult,
      recipients,
      sentRequests,
      receivedRequests,
      pendingSentCount,
      pendingReceivedCount,
      analytics,
    ] = await Promise.all([
      prismaPostgres.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          fullName: true,
          email: true,
          phone: true,
          wallet: {
            select: {
              updatedAt: true,
            },
          },
        },
      }),
      getWalletBalance(userId),
      getTransactionHistory({
        userId,
        limit: DEFAULT_DASHBOARD_TRANSACTION_LIMIT,
      }),
      getRecentRecipients(userId, DEFAULT_DASHBOARD_RECIPIENT_LIMIT),
      prismaPostgres.paymentRequest.findMany({
        where: {
          requesterId: userId,
          status: "PENDING",
        },
        orderBy: [{ createdAt: "desc" }, { id: "desc" }],
        take: DEFAULT_DASHBOARD_REQUEST_LIMIT,
        include: {
          requestedFrom: {
            select: {
              fullName: true,
              email: true,
            },
          },
        },
      }),
      prismaPostgres.paymentRequest.findMany({
        where: {
          requestedFromId: userId,
          status: "PENDING",
        },
        orderBy: [{ createdAt: "desc" }, { id: "desc" }],
        take: DEFAULT_DASHBOARD_REQUEST_LIMIT,
        include: {
          requester: {
            select: {
              fullName: true,
              email: true,
            },
          },
        },
      }),
      prismaPostgres.paymentRequest.count({
        where: {
          requesterId: userId,
          status: "PENDING",
        },
      }),
      prismaPostgres.paymentRequest.count({
        where: {
          requestedFromId: userId,
          status: "PENDING",
        },
      }),
      getLedgerAnalytics(userId, DEFAULT_DASHBOARD_ANALYTICS_MONTHS),
    ]);

    if (!user) {
      throw new Error("User not found");
    }

    const latestRequestAt = [
      sentRequests[0]?.createdAt,
      receivedRequests[0]?.createdAt,
    ]
      .filter((value): value is Date => value instanceof Date)
      .sort((a, b) => b.getTime() - a.getTime())[0];

    return {
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
      },
      wallet: wallet,
      transactions: {
        items: transactionsResult.transactions.map((transaction) => ({
          id: transaction.id,
          type: transaction.type,
          amount: transaction.amount,
          direction: transaction.amount.startsWith("-") ? "debit" : "credit",
          status: transaction.status,
          createdAt: transaction.createdAt,
          display: {
            title: transaction.display.title,
            subtitle: transaction.display.subtitle,
            image: transaction.display.image,
          },
        })),
        hasMore: transactionsResult.hasMore,
      },
      recipients,
      requests: {
        sent: sentRequests.map((request) => ({
          requestId: request.id,
          amount: Currency.toRupees(request.amount),
          reason: request.reason,
          status: request.status,
          expiresAt: request.expiresAt,
          respondedAt: request.respondedAt,
          createdAt: request.createdAt,
          direction: "sent",
          counterparty: {
            name: request.requestedFrom.fullName,
            email: request.requestedFrom.email,
          },
        })),
        received: receivedRequests.map((request) => ({
          requestId: request.id,
          amount: Currency.toRupees(request.amount),
          reason: request.reason,
          status: request.status,
          expiresAt: request.expiresAt,
          respondedAt: request.respondedAt,
          createdAt: request.createdAt,
          direction: "received",
          counterparty: {
            name: request.requester.fullName,
            email: request.requester.email,
          },
        })),
        pendingCounts: {
          sent: pendingSentCount,
          received: pendingReceivedCount,
        },
      },
      analytics: {
        summary: analytics.summary,
        categories: analytics.categories.slice(0, 3),
      },
      freshness: {
        generatedAt: new Date().toISOString(),
        walletUpdatedAt:
          user.wallet?.updatedAt?.toISOString() ?? wallet.lastUpdated,
        latestTransactionAt:
          transactionsResult.transactions[0]?.createdAt?.toISOString() ?? null,
        latestRequestAt: latestRequestAt?.toISOString() ?? null,
      },
    };
  });
};

export const withdrawToBankAccount = async (input: {
  userId: string;
  linkedAccountId: string;
  amount: string;
  pin: string;
  note?: string;
  idempotencyKey: string;
}) => {
  const {
    userId,
    linkedAccountId,
    amount: amountStr,
    pin,
    note,
    idempotencyKey,
  } = input;

  const amount = Currency.toPaise(amountStr);
  const minAmount = Currency.toPaise(ENV.MIN_TOPUP_AMOUNT);
  const maxAmount = Currency.toPaise(ENV.MAX_TOPUP_AMOUNT);

  if (!Currency.validate(amount, minAmount, maxAmount)) {
    throw new ApiError(
      400,
      "INVALID_AMOUNT",
      `Amount must be between ₹${ENV.MIN_TOPUP_AMOUNT} and ₹${ENV.MAX_TOPUP_AMOUNT}`,
    );
  }

  const user = await prismaPostgres.user.findUnique({
    where: { id: userId },
    select: { hashedPin: true },
  });

  if (!user?.hashedPin) {
    throw new ApiError(400, "PIN_NOT_SET", "Please set your PIN first");
  }

  const isPinValid = await verifyPin(pin, user.hashedPin);
  if (!isPinValid) {
    throw new ApiError(400, ErrorCodes.INVALID_PIN, "Invalid PIN");
  }

  const result = await prismaPostgres.$transaction(
    async (tx) => {
      const wallet = await tx.wallet.findUnique({
        where: { userId },
        select: {
          id: true,
          balance: true,
          status: true,
          isFrozen: true,
          version: true,
        },
      });

      if (!wallet) {
        throw new ApiError(404, "WALLET_NOT_FOUND", "Wallet not found");
      }

      if (wallet.status !== "ACTIVE") {
        throw new ApiError(400, "WALLET_NOT_ACTIVE", "Wallet is not active");
      }

      if (wallet.isFrozen) {
        throw new ApiError(400, "WALLET_FROZEN", "Wallet is frozen");
      }

      const linkedAccount = await tx.linkedBankAccount.findFirst({
        where: {
          id: linkedAccountId,
          userId,
        },
        include: {
          account: {
            select: {
              id: true,
              bankName: true,
              accountNumber: true,
              accountType: true,
              status: true,
              isFrozen: true,
              version: true,
              balance: true,
            },
          },
        },
      });

      if (!linkedAccount) {
        throw new ApiError(
          404,
          "ACCOUNT_NOT_LINKED",
          "Bank account not linked",
        );
      }

      if (linkedAccount.account.status !== "ACTIVE") {
        throw new ApiError(
          400,
          "ACCOUNT_NOT_ACTIVE",
          "Bank account is not active",
        );
      }

      if (linkedAccount.account.isFrozen) {
        throw new ApiError(400, "ACCOUNT_FROZEN", "Bank account is frozen");
      }

      if (wallet.balance < amount) {
        throw new ApiError(
          400,
          ErrorCodes.INSUFFICIENT_BALANCE,
          "Insufficient wallet balance",
          {
            required: Currency.toRupees(amount),
            available: Currency.toRupees(wallet.balance),
          },
        );
      }

      const walletUpdate = await tx.wallet.updateMany({
        where: {
          userId,
          version: wallet.version,
        },
        data: {
          balance: { decrement: amount },
          version: { increment: 1 },
        },
      });

      if (walletUpdate.count === 0) {
        throw new ApiError(
          409,
          "CONCURRENT_UPDATE",
          "Wallet balance changed. Please retry.",
        );
      }

      const accountUpdate = await tx.bankAccount.updateMany({
        where: {
          id: linkedAccount.account.id,
          version: linkedAccount.account.version,
        },
        data: {
          balance: { increment: amount },
          version: { increment: 1 },
        },
      });

      if (accountUpdate.count === 0) {
        throw new ApiError(
          409,
          "CONCURRENT_UPDATE",
          "Bank account changed. Please retry.",
        );
      }

      const balanceAfter = wallet.balance - amount;
      const transactionId = generateTransactionId("ledger");

      await tx.ledgerEntry.create({
        data: {
          id: transactionId,
          userId,
          referenceId: `WITHDRAW_${nanoid(21)}`,
          entryType: "ADMIN_ADJUSTMENT",
          amount: -amount,
          balanceBefore: wallet.balance,
          balanceAfter,
          status: "SUCCESS",
          description: `Wallet withdrawal to ${linkedAccount.account.bankName}`,
          notes: note,
          metadata: {
            kind: "WITHDRAWAL",
            linkedAccountId: linkedAccount.id,
            accountId: linkedAccount.account.id,
            bankName: linkedAccount.account.bankName,
            maskedAccount: linkedAccount.maskedAccount,
            idempotencyKey,
          },
        },
      });

      await enqueueRealtimeWalletUpdateTx(tx, {
        userId,
        balance: balanceAfter,
        transactionId,
        transactionAmount: -amount,
        transactionType: "WITHDRAWAL",
      });

      return {
        transactionId,
        amount: Currency.toRupees(amount),
        newBalance: Currency.toRupees(balanceAfter),
        bankAccount: {
          bankName: linkedAccount.account.bankName,
          maskedAccount: linkedAccount.maskedAccount,
          accountType: linkedAccount.account.accountType,
        },
        status: "SUCCESS" as const,
      };
    },
    {
      isolationLevel: "Serializable",
      timeout: 10000,
    },
  );

  await invalidateWalletReadCaches([userId]);
  return result;
};

export const getTransactionHistory1 = async (params: {
  userId: string;
  cursor?: string;
  limit?: number;
  type?: string;
  startDate?: Date;
  endDate?: Date;
}): Promise<TransactionHistoryResponse> => {
  const { userId, cursor, limit = 20, type, startDate, endDate } = params;

  const where: any = { userId };

  if (cursor) {
    where.id = { lt: cursor };
  }

  if (type) {
    where.entryType = type;
  }

  if (startDate || endDate) {
    where.createdAt = {};
    if (startDate) where.createdAt.gte = startDate;
    if (endDate) where.createdAt.lte = endDate;
  }

  const transactions = await prismaPostgres.ledgerEntry.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: limit + 1,
    select: {
      id: true,
      entryType: true,
      amount: true,
      balanceAfter: true,
      description: true,
      createdAt: true,
      metadata: true,
    },
  });

  const hasMore = transactions.length > limit;

  if (hasMore) transactions.pop();

  return {
    transactions: transactions.map((t) => ({
      ...t,
      amount: Currency.toRupees(t.amount),
      balanceAfter: Currency.toRupees(t.balanceAfter),
    })),
    nextCursor: transactions[transactions.length - 1]?.id,
    hasMore,
  };
};
