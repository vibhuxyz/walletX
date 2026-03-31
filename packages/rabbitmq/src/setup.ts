import { getRabbitMQChannel } from "./connection.js";
import { Exchanges, Queues, RoutingKeys } from "./exchange.js";
import { Logger } from "@repo/libs";

const logger = new Logger("RabbitMQSetup");

export const setupExchangeQueue = async () => {
  const channel = await getRabbitMQChannel();

  // ✅ NEW: Realtime exchange
  await channel.assertExchange(Exchanges.REALTIME_EVENTS, "topic", {
    durable: true,
  });

  // declare Exchanges
  await channel.assertExchange(Exchanges.NOTIFICATIONS, "topic", {
    durable: true,
  });

  await channel.assertExchange(Exchanges.WALLET_EVENTS, "topic", {
    durable: true,
  });

  await channel.assertExchange(Exchanges.BANK_EVENTS, "topic", {
    durable: true,
  });

  await channel.assertExchange(Exchanges.DLX, "topic", {
    durable: true,
  });

  // Declare queues

  const queuePairs: Array<{ queue: string; dlq: string }> = [
    { queue: Queues.EMAIL, dlq: Queues.EMAIL_DLQ },
    { queue: Queues.BANK_DEBIT_SUCCESS, dlq: Queues.BANK_DEBIT_SUCCESS_DLQ },
    { queue: Queues.BANK_DEBIT_FAILED, dlq: Queues.BANK_DEBIT_FAILED_DLQ },
    { queue: Queues.REALTIME_TRANSACTION, dlq: Queues.REALTIME_TRANSACTION_DLQ },
    { queue: Queues.REALTIME_BALANCE, dlq: Queues.REALTIME_BALANCE_DLQ },
    { queue: Queues.MERCHANT_PAYMENT, dlq: Queues.MERCHANT_PAYMENT_DLQ },
    { queue: Queues.SETTLEMENT, dlq: Queues.SETTLEMENT_DLQ },
  ];

  for (const { queue, dlq } of queuePairs) {
    await channel.assertQueue(queue, { durable: true });
    await channel.assertQueue(dlq, { durable: true });
    await channel.bindQueue(dlq, Exchanges.DLX, `${queue}.dead`);
  }

  await channel.assertQueue(Queues.SMS, { durable: true });
  await channel.assertQueue(Queues.DLQ_ALERTS, { durable: true });

  //  # and * diff

  await channel.bindQueue(Queues.EMAIL, Exchanges.NOTIFICATIONS, "email.#");
  await channel.bindQueue(Queues.SMS, Exchanges.NOTIFICATIONS, "sms.#");

  await channel.bindQueue(
    Queues.REALTIME_TRANSACTION,
    Exchanges.REALTIME_EVENTS,
    RoutingKeys.REALTIME_TRANSACTION,
  );

  await channel.bindQueue(
    Queues.REALTIME_BALANCE,
    Exchanges.REALTIME_EVENTS,
    RoutingKeys.REALTIME_BALANCE,
  );

  await channel.bindQueue(
    Queues.BANK_DEBIT_SUCCESS,
    Exchanges.BANK_EVENTS,
    RoutingKeys.BANK_DEBIT_SUCCESS,
  );

  await channel.bindQueue(
    Queues.BANK_DEBIT_FAILED,
    Exchanges.BANK_EVENTS,
    RoutingKeys.BANK_DEBIT_FAILED,
  );

  await channel.bindQueue(
    Queues.MERCHANT_PAYMENT,
    Exchanges.WALLET_EVENTS,
    RoutingKeys.MERCHANT_PAYMENT_SUCCESS,
  );

  await channel.bindQueue(Queues.DLQ_ALERTS, Exchanges.DLX, RoutingKeys.DLQ_ALERT);

  logger.info("RabbitMQ exchanges and queues setup complete");
};
