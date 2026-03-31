import { prismaPostgres } from "@repo/db-postgres";
import { Logger } from "@repo/libs";
import { Queues, requeueDlqMessages } from "@repo/rabbitmq";

const logger = new Logger("DebugWorker");

export async function checkStuckOrders() {
  // Find orders that are PROCESSING but have no SUCCESS/FAILED ledger
  const stuckOrders = await prismaPostgres.paymentOrder.findMany({
    where: {
      status: { in: ["PROCESSING", "PENDING"] },
      createdAt: {
        lt: new Date(Date.now() - 5 * 60 * 1000), // Older than 5 minutes
      },
    },
    include: {
      ledger: true,
    },
  });

  for (const order of stuckOrders) {
    logger.warn("Found stuck order", {
      orderId: order.id,
      status: order.status,
      ledgerStatus: order.ledger?.status,
      createdAt: order.createdAt,
    });
  }

  return stuckOrders;
}

export async function requeueFailedTopupMessages(limit: number = 20) {
  const requeued = await requeueDlqMessages(
    Queues.BANK_DEBIT_SUCCESS_DLQ,
    Queues.BANK_DEBIT_SUCCESS,
    limit,
  );

  logger.info("Requeued bank debit success DLQ messages", {
    limit,
    requeued,
  });

  return requeued;
}

export async function requeueFailedEmailMessages(limit: number = 20) {
  const requeued = await requeueDlqMessages(
    Queues.EMAIL_DLQ,
    Queues.EMAIL,
    limit,
  );

  logger.info("Requeued email DLQ messages", {
    limit,
    requeued,
  });

  return requeued;
}

// Run this manually:
// checkStuckOrders().then(orders => {
//   console.log(`Found ${orders.length} stuck orders`);
// });
