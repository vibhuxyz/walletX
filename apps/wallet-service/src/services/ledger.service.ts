import { prismaPostgres } from "@repo/db-postgres";
import { ApiError, Currency, formatLedgerEntry, Logger } from "@repo/libs";
import { cacheGetOrSet, RedisKeys, RedisTTL } from "@repo/redis";
import { ledgerRepository } from "../repositories/ledger.repository.js";

const logger = new Logger("LedgerService");
const REQUEST_PAYMENT_ENTRY_TYPE = "PAYMENT_REQUEST_PAID";
const REQUEST_PAYMENT_PENDING_STATUS = "PENDING";
const REQUEST_PAYMENT_SUCCESS_STATUS = "SUCCESS";

function encodeLedgerCursor(createdAt: Date, id: string) {
  return Buffer.from(
    JSON.stringify({
      createdAt: createdAt.toISOString(),
      id,
    }),
  ).toString("base64url");
}

function decodeLedgerCursor(cursor: string) {
  try {
    const decoded = JSON.parse(
      Buffer.from(cursor, "base64url").toString("utf-8"),
    ) as {
      createdAt?: string;
      id?: string;
    };

    if (!decoded.createdAt || !decoded.id) {
      return null;
    }

    const createdAt = new Date(decoded.createdAt);
    if (Number.isNaN(createdAt.getTime())) {
      return null;
    }

    return {
      createdAt,
      id: decoded.id,
    };
  } catch {
    return null;
  }
}

async function selfHealRequestPaymentLedgerStatuses(entryIds: string[]) {
  if (entryIds.length === 0) {
    return;
  }

  try {
    const result = await ledgerRepository.markRequestPaidAsSuccess(entryIds);

    if (result.count > 0) {
      logger.info("Healed stale request payment ledger statuses", {
        count: result.count,
      });
    }
  } catch (error) {
    logger.warn("Failed to heal request payment ledger statuses", {
      error: error instanceof Error ? error.message : String(error),
      entryCount: entryIds.length,
    });
  }
}

/**
 * Get user's ledger entries with filtering and pagination
 */
export async function getUserLedgerEntries(
  userId: string,
  options: {
    limit?: number;
    offset?: number;
    cursor?: string;
    type?: string;
    category?: string;
    status?: string; // Filter by actual status column
    startDate?: Date;
    endDate?: Date;
  } = {},
) {
  const {
    limit = 50,
    offset = 0,
    cursor,
    type,
    category,
    status,
    startDate,
    endDate,
  } = options;

  logger.info("Fetching ledger entries", { userId, options });

  // Build where clause
  const where: any = {
    userId,
  };

  // Filter by actual status column in database
  if (status) {
    where.status = status; // Use the real status field!
  }

  // Filter by specific entry type
  if (type) {
    where.entryType = type;
  }

  // Filter by category
  if (category) {
    const categoryMap: Record<string, string[]> = {
      topup: ["WALLET_TOPUP"],
      p2p: ["P2P_SEND", "P2P_RECEIVE"],
      merchant: ["MERCHANT_PAYMENT", "MERCHANT_REFUND"],
      request: ["PAYMENT_REQUEST_PAID"],
      admin: ["ADMIN_ADJUSTMENT"],
    };

    if (categoryMap[category]) {
      where.entryType = { in: categoryMap[category] };
    }
  }

  // Filter by date range
  if (startDate || endDate) {
    where.createdAt = {};
    if (startDate) {
      where.createdAt.gte = startDate;
    }
    if (endDate) {
      where.createdAt.lte = endDate;
    }
  }

  const cursorToken = cursor ? decodeLedgerCursor(cursor) : null;
  if (cursor && !cursorToken) {
    throw new ApiError(400, "INVALID_CURSOR", "Invalid cursor token");
  }

  if (cursorToken) {
    const cursorClause = {
      OR: [
        { createdAt: { lt: cursorToken.createdAt } },
        {
          AND: [
            { createdAt: cursorToken.createdAt },
            { id: { lt: cursorToken.id } },
          ],
        },
      ],
    };

    if (where.createdAt) {
      const rangeClause = { createdAt: where.createdAt };
      delete where.createdAt;
      where.AND = [...(where.AND || []), rangeClause, cursorClause];
    } else {
      where.AND = [...(where.AND || []), cursorClause];
    }
  }

  // Cursor mode avoids expensive count() and is more scalable for large ledgers.
  const isCursorMode = Boolean(cursorToken);
  const [fetchedEntries, total] = await Promise.all([
    ledgerRepository.findMany({
      where,
      take: isCursorMode ? limit + 1 : limit,
      skip: isCursorMode ? 0 : offset,
    }),
    isCursorMode ? Promise.resolve(0) : ledgerRepository.count(where),
  ]);

  const hasMoreByCursor = isCursorMode && fetchedEntries.length > limit;
  const entries = hasMoreByCursor
    ? fetchedEntries.slice(0, limit)
    : fetchedEntries;

  const staleRequestPaymentEntryIds = entries
    .filter(
      (entry) =>
        entry.entryType === REQUEST_PAYMENT_ENTRY_TYPE &&
        entry.status === REQUEST_PAYMENT_PENDING_STATUS,
    )
    .map((entry) => entry.id);

  if (staleRequestPaymentEntryIds.length > 0) {
    await selfHealRequestPaymentLedgerStatuses(staleRequestPaymentEntryIds);

    const staleIds = new Set(staleRequestPaymentEntryIds);
    for (const entry of entries) {
      if (staleIds.has(entry.id)) {
        (entry as any).status = REQUEST_PAYMENT_SUCCESS_STATUS;
      }
    }
  }

  // Format entries - status already filtered in where clause
  const formattedEntries = entries.map((entry) =>
    formatLedgerEntry(entry, userId),
  );

  logger.info("Ledger entries fetched", {
    userId,
    count: formattedEntries.length,
    total,
  });

  let nextCursor: string | undefined;
  if (isCursorMode && hasMoreByCursor && entries.length > 0) {
    const lastEntry = entries[entries.length - 1]!;
    nextCursor = encodeLedgerCursor(lastEntry.createdAt, lastEntry.id);
  }

  return {
    entries: formattedEntries,
    pagination: {
      total: isCursorMode ? 0 : total,
      limit,
      offset,
      hasMore: isCursorMode ? hasMoreByCursor : offset + limit < total,
      nextCursor,
    },
  };
}

/**
 * Get single ledger entry details
 */
export async function getLedgerEntryDetails(userId: string, entryId: string) {
  logger.info("Fetching ledger entry details", { userId, entryId });

  const entry = await ledgerRepository.findOneById(userId, entryId);

  if (!entry) {
    throw new ApiError(
      404,
      "ENTRY_NOT_FOUND",
      "Ledger entry not found or you don't have access to it.",
    );
  }

  if (
    entry.entryType === REQUEST_PAYMENT_ENTRY_TYPE &&
    entry.status === REQUEST_PAYMENT_PENDING_STATUS
  ) {
    await selfHealRequestPaymentLedgerStatuses([entry.id]);
    (entry as any).status = REQUEST_PAYMENT_SUCCESS_STATUS;
  }

  const formatted = formatLedgerEntry(entry, userId);

  logger.info("Ledger entry details fetched", { userId, entryId });

  return formatted;
}

/**
 * Get ledger statistics
 */
function toLedgerStatsCacheSegment(date?: Date) {
  return date ? date.toISOString() : "all";
}

function buildLedgerStatsWhere(
  userId: string,
  startDate?: Date,
  endDate?: Date,
) {
  const where: any = { userId };

  if (startDate || endDate) {
    where.createdAt = {};
    if (startDate) where.createdAt.gte = startDate;
    if (endDate) where.createdAt.lte = endDate;
  }

  return where;
}

export async function getLedgerStatistics(
  userId: string,
  startDate?: Date,
  endDate?: Date,
) {
  logger.info("Fetching ledger statistics", { userId, startDate, endDate });

  const cacheKey = RedisKeys.LEDGER_STATS(
    userId,
    toLedgerStatsCacheSegment(startDate),
    toLedgerStatsCacheSegment(endDate),
  );

  return cacheGetOrSet(cacheKey, RedisTTL.CACHE_LEDGER_STATS, async () => {
    const where = buildLedgerStatsWhere(userId, startDate, endDate);

    const statsGroups = await prismaPostgres.ledgerEntry.groupBy({
      by: ["entryType", "status"],
      where,
      _sum: {
        amount: true,
      },
      _count: true,
    });

    const stats = {
      totalTransactions: 0,
      topups: {
        count: 0,
        totalAmount: BigInt(0),
        successCount: 0,
        failedCount: 0,
      },
      p2p: {
        sent: { count: 0, totalAmount: BigInt(0) },
        received: { count: 0, totalAmount: BigInt(0) },
      },
      merchant: {
        payments: { count: 0, totalAmount: BigInt(0) },
        refunds: { count: 0, totalAmount: BigInt(0) },
      },
      requests: {
        count: 0,
        totalAmount: BigInt(0),
      },
    };

    statsGroups.forEach((group: any) => {
      const count = group._count;
      const amount = group._sum.amount || BigInt(0);
      const status = group.status;
      const type = group.entryType;

      stats.totalTransactions += count;

      switch (type) {
        case "WALLET_TOPUP":
          stats.topups.count += count;
          if (status === "SUCCESS") {
            stats.topups.totalAmount += amount;
            stats.topups.successCount += count;
          } else if (status === "FAILED") {
            stats.topups.failedCount += count;
          }
          break;

        case "P2P_SEND":
          stats.p2p.sent.count += count;
          stats.p2p.sent.totalAmount += amount;
          break;

        case "P2P_RECEIVE":
          stats.p2p.received.count += count;
          stats.p2p.received.totalAmount += amount;
          break;

        case "MERCHANT_PAYMENT":
          stats.merchant.payments.count += count;
          stats.merchant.payments.totalAmount += amount;
          break;

        case "MERCHANT_REFUND":
          stats.merchant.refunds.count += count;
          stats.merchant.refunds.totalAmount += amount;
          break;

        case "PAYMENT_REQUEST_PAID":
          stats.requests.count += count;
          stats.requests.totalAmount += amount;
          break;
      }
    });

    return {
      totalTransactions: stats.totalTransactions,
      topups: {
        count: stats.topups.count,
        totalAmount: Currency.toRupees(stats.topups.totalAmount),
        successCount: stats.topups.successCount,
        failedCount: stats.topups.failedCount,
      },
      p2p: {
        sent: {
          count: stats.p2p.sent.count,
          totalAmount: Currency.toRupees(stats.p2p.sent.totalAmount),
        },
        received: {
          count: stats.p2p.received.count,
          totalAmount: Currency.toRupees(stats.p2p.received.totalAmount),
        },
      },
      merchant: {
        payments: {
          count: stats.merchant.payments.count,
          totalAmount: Currency.toRupees(stats.merchant.payments.totalAmount),
        },
        refunds: {
          count: stats.merchant.refunds.count,
          totalAmount: Currency.toRupees(stats.merchant.refunds.totalAmount),
        },
      },
      requests: {
        count: stats.requests.count,
        totalAmount: Currency.toRupees(stats.requests.totalAmount),
      },
    };
  });
}

const INCOME_ENTRY_TYPES = new Set([
  "WALLET_TOPUP",
  "P2P_RECEIVE",
  "MERCHANT_REFUND",
]);

const EXPENSE_ENTRY_TYPES = new Set([
  "P2P_SEND",
  "MERCHANT_PAYMENT",
  "PAYMENT_REQUEST_PAID",
]);

const SPENDING_LABELS: Record<string, string> = {
  P2P_SEND: "Transfers",
  MERCHANT_PAYMENT: "Merchant Payments",
  PAYMENT_REQUEST_PAID: "Request Payments",
};

type LedgerAnalyticsEntry = {
  entryType: string;
  amount: bigint;
  createdAt: Date;
  metadata: unknown;
};

function toMonthKey(date: Date) {
  const year = date.getUTCFullYear();
  const month = date.getUTCMonth() + 1;
  return `${year}-${month.toString().padStart(2, "0")}`;
}

function monthLabelFromKey(monthKey: string) {
  const [yearStr, monthStr] = monthKey.split("-");
  const year = Number(yearStr);
  const month = Number(monthStr);

  return new Date(Date.UTC(year, month - 1, 1)).toLocaleDateString("en-IN", {
    month: "short",
    year: "2-digit",
    timeZone: "UTC",
  });
}

function addMonths(date: Date, delta: number) {
  return new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + delta, 1, 0, 0, 0, 0),
  );
}

function buildLedgerAnalytics(entries: LedgerAnalyticsEntry[], months: number) {
  const safeMonths = Number.isFinite(months)
    ? Math.max(1, Math.min(24, Math.floor(months)))
    : 6;

  const now = new Date();
  const currentMonthStart = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1, 0, 0, 0, 0),
  );
  const startDate = addMonths(currentMonthStart, -(safeMonths - 1));
  const endDate = new Date(
    Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      now.getUTCDate(),
      23,
      59,
      59,
      999,
    ),
  );

  const monthlyMap = new Map<
    string,
    { income: bigint; expense: bigint; net: bigint }
  >();

  for (let i = 0; i < safeMonths; i++) {
    const monthDate = addMonths(startDate, i);
    monthlyMap.set(toMonthKey(monthDate), {
      income: BigInt(0),
      expense: BigInt(0),
      net: BigInt(0),
    });
  }

  const categoryAmountMap = new Map<string, bigint>();
  const categoryCountMap = new Map<string, number>();

  let totalIncome = BigInt(0);
  let totalExpenses = BigInt(0);

  for (const entry of entries) {
    const monthKey = toMonthKey(entry.createdAt);
    const monthBucket = monthlyMap.get(monthKey);
    if (!monthBucket) continue;
    const normalizedAmount = entry.amount < 0n ? -entry.amount : entry.amount;
    const isWithdrawal =
      entry.entryType === "ADMIN_ADJUSTMENT" &&
      (entry.metadata as any)?.kind === "WITHDRAWAL";

    if (INCOME_ENTRY_TYPES.has(entry.entryType)) {
      totalIncome += normalizedAmount;
      monthBucket.income += normalizedAmount;
      monthBucket.net += normalizedAmount;
      continue;
    }

    if (EXPENSE_ENTRY_TYPES.has(entry.entryType) || isWithdrawal) {
      totalExpenses += normalizedAmount;
      monthBucket.expense += normalizedAmount;
      monthBucket.net -= normalizedAmount;

      const categoryName = isWithdrawal
        ? "Withdrawals"
        : (SPENDING_LABELS[entry.entryType] ?? "Other");
      categoryAmountMap.set(
        categoryName,
        (categoryAmountMap.get(categoryName) || BigInt(0)) + normalizedAmount,
      );
      categoryCountMap.set(
        categoryName,
        (categoryCountMap.get(categoryName) || 0) + 1,
      );
    }
  }

  const netFlow = totalIncome - totalExpenses;
  const averageIncome = totalIncome / BigInt(safeMonths);
  const averageExpenses = totalExpenses / BigInt(safeMonths);

  const monthly = Array.from(monthlyMap.entries()).map(
    ([monthKey, values]) => ({
      month: monthLabelFromKey(monthKey),
      income: Currency.toRupees(values.income),
      expense: Currency.toRupees(values.expense),
      net: Currency.toRupees(values.net),
    }),
  );

  const expenseTotalFloat = parseFloat(Currency.toRupees(totalExpenses));
  const categories = Array.from(categoryAmountMap.entries())
    .map(([name, amount]) => {
      const amountStr = Currency.toRupees(amount);
      const amountFloat = parseFloat(amountStr);
      const percentage =
        expenseTotalFloat > 0
          ? Number(((amountFloat / expenseTotalFloat) * 100).toFixed(2))
          : 0;

      return {
        name,
        amount: amountStr,
        percentage,
        transactionCount: categoryCountMap.get(name) || 0,
      };
    })
    .sort((a, b) => parseFloat(b.amount) - parseFloat(a.amount));

  return {
    period: {
      months: safeMonths,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
    },
    summary: {
      totalIncome: Currency.toRupees(totalIncome),
      totalExpenses: Currency.toRupees(totalExpenses),
      totalSpending: Currency.toRupees(totalExpenses),
      netFlow: Currency.toRupees(netFlow),
      averageMonthlyIncome: Currency.toRupees(averageIncome),
      averageMonthlyExpenses: Currency.toRupees(averageExpenses),
    },
    monthly,
    categories,
    totals: {
      successfulTransactions: entries.length,
    },
  };
}

/**
 * Get analytics summary for dashboard charts.
 * Uses only SUCCESS ledger entries to avoid counting failed/pending attempts.
 */
export async function getLedgerAnalytics(userId: string, months: number = 6) {
  const safeMonths = Number.isFinite(months)
    ? Math.max(1, Math.min(24, Math.floor(months)))
    : 6;
  const cacheKey = RedisKeys.LEDGER_ANALYTICS(userId, safeMonths);

  return cacheGetOrSet(cacheKey, RedisTTL.CACHE_LEDGER_ANALYTICS, async () => {
    const now = new Date();
    const currentMonthStart = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1, 0, 0, 0, 0),
    );
    const startDate = addMonths(currentMonthStart, -(safeMonths - 1));
    const endDate = new Date(
      Date.UTC(
        now.getUTCFullYear(),
        now.getUTCMonth(),
        now.getUTCDate(),
        23,
        59,
        59,
        999,
      ),
    );

    logger.info("Fetching ledger analytics", {
      userId,
      months: safeMonths,
      startDate,
      endDate,
    });

    const entries = await prismaPostgres.ledgerEntry.findMany({
      where: {
        userId,
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
        status: "SUCCESS",
      },
      select: {
        entryType: true,
        amount: true,
        createdAt: true,
        metadata: true,
      },
    });

    return buildLedgerAnalytics(entries, safeMonths);
  });
}
