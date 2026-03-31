import { getRabbitMQChannel } from "./connection.js";
import { CircuitBreaker, Logger, retryWithBackoff } from "@repo/libs";

const logger = new Logger("RabbitMQPublisher");
const publishCircuitBreaker = new CircuitBreaker({
  failureThreshold: 5,
  successThreshold: 2,
  resetTimeoutMs: 30_000,
});

export const publishMessage = async (
  exchange: string,
  routingKey: string,
  message: any,
): Promise<void> => {
  try {
    await publishCircuitBreaker.execute(async () => {
      await retryWithBackoff(
        async () => {
          const channel = await getRabbitMQChannel();
          logger.info("Publishing message", { exchange, routingKey, message });

          const published = channel.publish(
            exchange,
            routingKey,
            Buffer.from(JSON.stringify(message)),
            {
              persistent: true,
              contentType: "application/json",
            },
          );

          if (!published) {
            throw new Error("Channel publish buffer full");
          }
        },
        {
          maxAttempts: 4,
          initialDelayMs: 200,
          maxDelayMs: 5_000,
          factor: 2,
        },
      );
    });
    logger.debug("Message published", { exchange, routingKey });
  } catch (error) {
    logger.error("Failed to publish message", error);
    throw error;
  }
};

export const publishToQueue = async (queue: string, message: any) => {
  await publishCircuitBreaker.execute(async () => {
    await retryWithBackoff(
      async () => {
        const channel = await getRabbitMQChannel();
        const published = channel.sendToQueue(
          queue,
          Buffer.from(JSON.stringify(message)),
          {
            persistent: true,
            contentType: "application/json",
          },
        );

        if (!published) {
          throw new Error("Channel queue buffer full");
        }
      },
      {
        maxAttempts: 4,
        initialDelayMs: 200,
        maxDelayMs: 5_000,
        factor: 2,
      },
    );
  });
};

export const requeueDlqMessages = async (
  dlqQueue: string,
  targetQueue: string,
  maxCount: number = 50,
) => {
  const channel = await getRabbitMQChannel();
  await channel.assertQueue(dlqQueue, { durable: true });
  await channel.assertQueue(targetQueue, { durable: true });

  let requeued = 0;

  while (requeued < maxCount) {
    const msg = await channel.get(dlqQueue, { noAck: false });
    if (!msg) {
      break;
    }

    const headers = {
      ...(msg.properties.headers || {}),
      "x-retry-count": 0,
      "x-requeued-at": new Date().toISOString(),
      "x-original-dlq": dlqQueue,
    };

    channel.sendToQueue(targetQueue, msg.content, {
      persistent: true,
      contentType: msg.properties.contentType || "application/json",
      headers,
    });
    channel.ack(msg);
    requeued += 1;
  }

  logger.info("DLQ requeue completed", { dlqQueue, targetQueue, requeued });
  return requeued;
};
