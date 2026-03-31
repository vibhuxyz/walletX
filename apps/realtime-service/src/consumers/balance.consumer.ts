import { consumeQueue, Queues } from "@repo/rabbitmq";
import { Logger } from "@repo/libs";

import { WSEventType, type BalanceEvent } from "@repo/types";
import { connectionManager } from "../websocket/connectionManager.js";

const logger = new Logger("BalanceConsumer");

export async function startBalanceConsumer() {
  await consumeQueue(Queues.REALTIME_BALANCE, async (message) => {
    try {
      logger.info("📥 Received balance event", message);

      const event: BalanceEvent = message;

      // send webskcket evertnt of the user
      connectionManager.sendToUser(event.userId, {
        type: WSEventType.BALANCE_UPDATED,
        payload: {
          balance: event.balance,
          availableBalance: event.availableBalance,
        },
        timestamp: new Date().toISOString(),
      });

      logger.info(`✅ Balance event sent to user: ${event.userId}`);
    } catch (error) {
      logger.error("❌ Failed to process balance event", error);
      throw error;
    }
  });

  logger.info("🎧 Balance consumer started");
}
