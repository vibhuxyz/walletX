import { prismaPostgres } from "@repo/db-postgres";
import { Logger } from "@repo/libs";
import { Exchanges, publishMessage, RoutingKeys } from "@repo/rabbitmq";

const logger = new Logger("BankReconciliationJob");
const RECONCILIATION_INTERVAL_MS = 60 * 60 * 1000; // hourly
const STALE_ORDER_MINUTES = 30;

async function runReconciliation() {
  const staleBefore = new Date(
    Date.now() - STALE_ORDER_MINUTES * 60 * 1000,
  );

  const [successOrders, staleOrders] = await Promise.all([
    prismaPostgres.paymentOrder.findMany({
      where: {
        status: "SUCCESS",
        createdAt: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000),
        },
      },
      select: {
        id: true,
        amount: true,
        ledgerId: true,
        accountId: true,
        userId: true,
      },
    }),
    prismaPostgres.paymentOrder.count({
      where: {
        status: { in: ["PENDING", "PROCESSING"] },
        createdAt: { lt: staleBefore },
      },
    }),
  ]);

  const ledgerIds = successOrders
    .map((order) => order.ledgerId)
    .filter((ledgerId): ledgerId is string => Boolean(ledgerId));

  const ledgers = ledgerIds.length
    ? await prismaPostgres.ledgerEntry.findMany({
        where: { id: { in: ledgerIds } },
        select: {
          id: true,
          status: true,
          amount: true,
        },
      })
    : [];

  const ledgerById = new Map(ledgers.map((ledger) => [ledger.id, ledger]));
  const mismatches = successOrders
    .map((order) => {
      const ledger = order.ledgerId ? ledgerById.get(order.ledgerId) : null;
      if (!ledger) {
        return {
          orderId: order.id,
          reason: "LEDGER_NOT_FOUND",
          accountId: order.accountId,
          userId: order.userId,
        };
      }
      if (ledger.status !== "SUCCESS") {
        return {
          orderId: order.id,
          reason: "LEDGER_STATUS_MISMATCH",
          accountId: order.accountId,
          userId: order.userId,
        };
      }
      if (ledger.amount !== order.amount) {
        return {
          orderId: order.id,
          reason: "LEDGER_AMOUNT_MISMATCH",
          accountId: order.accountId,
          userId: order.userId,
        };
      }
      return null;
    })
    .filter((item): item is NonNullable<typeof item> => item !== null);

  const summary = {
    checkedSuccessOrders: successOrders.length,
    mismatches: mismatches.length,
    staleOrders,
    ranAt: new Date().toISOString(),
  };

  if (mismatches.length > 0 || staleOrders > 0) {
    await publishMessage(Exchanges.DLX, RoutingKeys.DLQ_ALERT, {
      type: "BANK_RECONCILIATION_ALERT",
      summary,
      sampleMismatches: mismatches.slice(0, 20),
    });
    logger.warn("Bank reconciliation found issues", summary);
  } else {
    logger.info("Bank reconciliation healthy", summary);
  }
}

export function startBankReconciliationJob() {
  const run = async () => {
    try {
      await runReconciliation();
    } catch (error) {
      logger.error("Bank reconciliation failed", error);
    }
  };

  void run();
  const timer = setInterval(() => {
    void run();
  }, RECONCILIATION_INTERVAL_MS);
  timer.unref();

  logger.info("Bank reconciliation job started", {
    intervalMs: RECONCILIATION_INTERVAL_MS,
  });
}

