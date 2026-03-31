import { prismaPostgres } from "@repo/db-postgres";
import { Logger } from "@repo/libs";
import { Exchanges, publishMessage, RoutingKeys } from "@repo/rabbitmq";

const logger = new Logger("WalletReconciliationJob");
const RECONCILIATION_INTERVAL_MS = 10 * 60 * 1000; // Every 10 minutes

async function runReconciliation() {
  logger.info("Executing Wallet Background Reconciliation Protocol...");

  // Fetch wallets that had activity in the last hour
  const activeWallets = await prismaPostgres.wallet.findMany({
    where: {
      status: "ACTIVE",
      updatedAt: {
        gte: new Date(Date.now() - 60 * 60 * 1000), // last 1 hour
      },
    },
    select: {
      id: true,
      userId: true,
      balance: true,
    },
  });

  if (!activeWallets.length) {
    logger.info("No active wallets to reconcile");
    return;
  }

  interface Discrepancy {
    userId: string;
    actualBalance: string;
    expectedBalance: string;
    difference: string;
  }
  const mismatches: Discrepancy[] = [];
  
  // To avoid saturating connection limits during a scan, we process in chunks
  const chunkSize = 100;
  for (let i = 0; i < activeWallets.length; i += chunkSize) {
    const chunk = activeWallets.slice(i, i + chunkSize);
    
    await Promise.all(
      chunk.map(async (wallet) => {
        // Compute the expected theoretical balance directly from the Ledger Aggregation
        const aggregation = await prismaPostgres.ledgerEntry.aggregate({
          where: { userId: wallet.userId, status: "SUCCESS" },
          _sum: { amount: true },
        });

        const expectedBalance = aggregation._sum.amount || BigInt(0);

        if (expectedBalance !== wallet.balance) {
            mismatches.push({
                userId: wallet.userId,
                actualBalance: wallet.balance.toString(),
                expectedBalance: expectedBalance.toString(),
                difference: (wallet.balance - expectedBalance).toString()
            });
        }
      })
    );
  }

  const summary = {
    checkedWallets: activeWallets.length,
    mismatchesFound: mismatches.length,
    ranAt: new Date().toISOString(),
  };

  if (mismatches.length > 0) {
    logger.warn("Wallet reconciliation identified discrepancies!", summary);
    // Throw to DLX / Fraud Monitoring
    await publishMessage(Exchanges.DLX, RoutingKeys.DLQ_ALERT, {
      type: "WALLET_RECONCILIATION_FRAUD_ALERT",
      summary,
      sampleMismatches: mismatches.slice(0, 10),
    });
  } else {
    logger.info("Wallet reconciliation Healthy - 100% Match", summary);
  }
}

export function startWalletReconciliationJob() {
  const run = async () => {
    try {
      await runReconciliation();
    } catch (error) {
      logger.error("Wallet reconciliation failed natively", error);
    }
  };

  // initial execution
  setTimeout(() => {
    void run();
  }, 5000).unref(); // delay 5s on boot

  const timer = setInterval(() => {
    void run();
  }, RECONCILIATION_INTERVAL_MS);
  
  timer.unref();

  logger.info("Wallet reconciliation background worker started", {
    intervalMs: RECONCILIATION_INTERVAL_MS,
  });
}
