import { Logger } from "@repo/libs";
import { consumeQueue, Queues } from "@repo/rabbitmq";

const logger = new Logger("DlqAlertConsumer");

export async function startDlqAlertConsumer() {
  await consumeQueue(
    Queues.DLQ_ALERTS,
    async (message) => {
      if (message?.type) {
        logger.error(`Reconciliation alert received: ${message.type}`, message);
      } else {
        logger.error("DLQ alert received", {
          queue: message?.queue,
          dlqQueue: message?.dlqQueue,
          retryCount: message?.retryCount,
          failedAt: message?.failedAt,
          error: message?.error,
        });
      }
    },
    {
      maxRetries: 0,
    },
  );

  logger.info("DLQ alert consumer started");
}

