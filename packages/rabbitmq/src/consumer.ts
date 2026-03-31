import { Logger } from "@repo/libs";
import { getRabbitMQChannel } from "./connection.js";
import { Exchanges, Queues, RoutingKeys } from "./exchange.js";

const logger = new Logger("RabbitMQConsumer");

interface ConsumeOptions {
  maxRetries?: number;
  baseDelayMs?: number;
}

const DEFAULT_MAX_RETRIES = 4;
const DEFAULT_BASE_DELAY_MS = 500;

const DLQ_BY_QUEUE: Record<string, string> = {
  [Queues.EMAIL]: Queues.EMAIL_DLQ,
  [Queues.BANK_DEBIT_SUCCESS]: Queues.BANK_DEBIT_SUCCESS_DLQ,
  [Queues.BANK_DEBIT_FAILED]: Queues.BANK_DEBIT_FAILED_DLQ,
  [Queues.REALTIME_TRANSACTION]: Queues.REALTIME_TRANSACTION_DLQ,
  [Queues.REALTIME_BALANCE]: Queues.REALTIME_BALANCE_DLQ,
  [Queues.MERCHANT_PAYMENT]: Queues.MERCHANT_PAYMENT_DLQ,
  [Queues.SETTLEMENT]: Queues.SETTLEMENT_DLQ,
};

function getRetryCount(msg: any) {
  const value = msg.properties?.headers?.["x-retry-count"];
  const retryCount = Number(value ?? 0);
  return Number.isFinite(retryCount) ? retryCount : 0;
}

function computeBackoffDelayMs(retryCount: number, baseDelayMs: number) {
  const delay = baseDelayMs * Math.pow(2, retryCount);
  return Math.min(delay, 30_000);
}

export const consumeQueue = async (
  queue: string,
  handler: (message: any) => Promise<void>,
  options: ConsumeOptions = {},
) => {
  const channel = await getRabbitMQChannel();
  const maxRetries = options.maxRetries ?? DEFAULT_MAX_RETRIES;
  const baseDelayMs = options.baseDelayMs ?? DEFAULT_BASE_DELAY_MS;

  await channel.consume(
    queue,
    async (msg) => {
      if (!msg) return;

      try {
        const content = JSON.parse(msg.content.toString());
        logger.debug("Message received", { queue, content });

        await handler(content);
        channel.ack(msg);
        logger.debug("Message acknowledged", { queue });
      } catch (error) {
        const retryCount = getRetryCount(msg);
        const nextRetryCount = retryCount + 1;

        logger.error("Error processing message", {
          queue,
          retryCount,
          maxRetries,
          error,
        });

        if (retryCount < maxRetries) {
          const delayMs = computeBackoffDelayMs(retryCount, baseDelayMs);
          const headers = {
            ...(msg.properties?.headers || {}),
            "x-retry-count": nextRetryCount,
            "x-original-queue": queue,
            "x-last-error":
              error instanceof Error ? error.message : String(error),
          };

          setTimeout(() => {
            channel.sendToQueue(queue, msg.content, {
              persistent: true,
              contentType: msg.properties?.contentType || "application/json",
              headers,
            });
          }, delayMs);

          channel.ack(msg);
          logger.warn("Message scheduled for retry with backoff", {
            queue,
            retryCount: nextRetryCount,
            delayMs,
          });
          return;
        }

        const dlqQueue = DLQ_BY_QUEUE[queue] ?? `${queue}.dlq`;
        await channel.assertQueue(dlqQueue, { durable: true });
        channel.sendToQueue(dlqQueue, msg.content, {
          persistent: true,
          contentType: msg.properties?.contentType || "application/json",
          headers: {
            ...(msg.properties?.headers || {}),
            "x-retry-count": retryCount,
            "x-original-queue": queue,
            "x-final-failure": true,
          },
        });

        channel.publish(
          Exchanges.DLX,
          RoutingKeys.DLQ_ALERT,
          Buffer.from(
            JSON.stringify({
              queue,
              dlqQueue,
              retryCount,
              failedAt: new Date().toISOString(),
              error: error instanceof Error ? error.message : String(error),
            }),
          ),
          {
            persistent: true,
            contentType: "application/json",
          },
        );

        channel.ack(msg);
        logger.error("Message moved to DLQ", {
          queue,
          dlqQueue,
          retryCount,
        });
      }
    },
    { noAck: false },
  );
  logger.info(`Consuming queue: ${queue}`);
};
