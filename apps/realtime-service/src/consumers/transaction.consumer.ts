import { consumeQueue, Queues } from "@repo/rabbitmq";
import { Logger } from "@repo/libs";

import { WSEventType, type TransactionEvent } from "@repo/types";
import { connectionManager } from "../websocket/connectionManager.js";

const logger = new Logger("TransactionConsumer");

export async function startTransactionConsumer() {
  await consumeQueue(Queues.REALTIME_TRANSACTION, async (message) => {
    try {
      logger.info("📥 Received transaction event", message);

      const event: TransactionEvent = message;

      // send websocket evernt to the user
      connectionManager.sendToUser(event.userId, {
        type: WSEventType.TRANSACTION_UPDATED,
        payload: {
          transactionId: event.transactionId,
          status: event.status,
          amount: event.amount,
          type: event.type,
        },
        timestamp: new Date().toISOString(),
      });

      logger.info(`✅ Transaction event sent to user: ${event.userId}`);
    } catch (error) {
      logger.error("❌ Failed to process transaction event", error);
      throw error; // Requeue
    }
  });

  logger.info("🎧 Transaction consumer started");
}
