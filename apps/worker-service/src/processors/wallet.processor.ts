import { prismaPostgres } from "@repo/db-postgres";
import { Currency, Logger } from "@repo/libs";
import { Exchanges, RoutingKeys } from "@repo/rabbitmq";
import { invalidateCachePattern, redis, RedisKeys } from "@repo/redis";

const logger = new Logger("WalletProcessor");

const enqueueOutboxEventTx = async (
  tx: any,
  event: {
    exchange: string;
    routingKey: string;
    payload: unknown;
    availableAt?: Date;
  },
) => {
  const id = `out_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
  const availableAt = event.availableAt ?? new Date();

  await tx.$executeRawUnsafe(
    `INSERT INTO outbox_events
      (id, exchange, routing_key, payload, status, attempts, available_at, created_at, updated_at)
     VALUES
      ($1, $2, $3, $4::jsonb, 'PENDING', 0, $5, NOW(), NOW())`,
    id,
    event.exchange,
    event.routingKey,
    JSON.stringify(event.payload),
    availableAt,
  );
};

export const creditWallet = async (
  accountId: string,
  amountStr: string,
  referenceId: string,
) => {
  const amount = BigInt(amountStr);

  logger.info("Processing wallet credit (SUCCESS)", {
    accountId,
    amountStr,
    referenceId,
  });

  // Find payment order
  const order = await prismaPostgres.paymentOrder.findFirst({
    where: {
      id: referenceId,
      accountId,
      status: "PROCESSING",
    },
    select: { id: true, userId: true, amount: true, ledgerId: true },
  });

  if (!order) {
    logger.error("Payment order not found or not in PROCESSING state", {
      accountId,
      referenceId,
    });
    throw new Error("Payment order not found");
  }

  if (!order.ledgerId) {
    logger.error("Ledger ID not found in order", { orderId: order.id });
    throw new Error("Ledger ID missing");
  }

  // Credit wallet in transaction
  await prismaPostgres.$transaction(async (tx) => {
    const wallet = await tx.wallet.findUniqueOrThrow({
      where: { userId: order.userId },
      select: { balance: true, version: true },
    });

    const newBalance = wallet.balance + amount;

    // ✅ FIX: Remove 'as any'
    await tx.ledgerEntry.update({
      where: { id: order.ledgerId! },
      data: {
        status: "SUCCESS",
        balanceAfter: newBalance,
        description: "Wallet topup completed successfully",
        notes: "Bank debit successful",
      },
    });

    // Update wallet balance
    await tx.wallet.update({
      where: {
        userId: order.userId,
        version: wallet.version,
      },
      data: {
        balance: newBalance,
        version: { increment: 1 },
      },
    });

    // Update payment order status
    await tx.paymentOrder.update({
      where: { id: order.id },
      data: {
        status: "SUCCESS",
      },
    });

    await enqueueOutboxEventTx(tx, {
      exchange: Exchanges.REALTIME_EVENTS,
      routingKey: RoutingKeys.REALTIME_TRANSACTION,
      payload: {
        userId: order.userId,
        transactionId: order.ledgerId,
        status: "SUCCESS",
        amount: Currency.toRupees(amount),
        type: "WALLET_TOPUP",
      },
    });

    await enqueueOutboxEventTx(tx, {
      exchange: Exchanges.REALTIME_EVENTS,
      routingKey: RoutingKeys.REALTIME_BALANCE,
      payload: {
        userId: order.userId,
        balance: Currency.toRupees(newBalance),
        availableBalance: Currency.toRupees(newBalance),
      },
    });
  });

  // Clear wallet balance cache
  await Promise.all([
    redis.del(RedisKeys.WALLET_BALANCE(order.userId)),
    redis.del(RedisKeys.DASHBOARD_SUMMARY(order.userId)),
    redis.del(RedisKeys.DASHBOARD_FRESHNESS(order.userId)),
    invalidateCachePattern(RedisKeys.LEDGER_ANALYTICS_PATTERN(order.userId)),
  ]);

  logger.info("✅ Wallet credited successfully", {
    userId: order.userId,
    amount: Currency.toRupees(amount),
    orderId: order.id,
  });
};

export const handleFailedDebit = async (
  accountId: string,
  amountStr: string,
  referenceId: string,
  failureReason: string,
  failureCode: string,
) => {
  logger.info("Processing wallet debit FAILURE", {
    accountId,
    referenceId,
    failureReason,
  });

  // ✅ FIX: Look for PROCESSING or PENDING status
  const order = await prismaPostgres.paymentOrder.findFirst({
    where: {
      id: referenceId,
      accountId,
      status: { in: ["PROCESSING", "PENDING"] }, // ← FIXED: Accept both statuses
    },
    select: { id: true, userId: true, ledgerId: true, status: true },
  });

  if (!order) {
    logger.warn("Payment order not found or already processed", {
      accountId,
      referenceId,
    });
    // ✅ FIX: Don't throw - just return (prevents infinite requeue)
    return;
  }

  if (!order.ledgerId) {
    logger.error("Ledger ID not found in order", { orderId: order.id });
    // ✅ FIX: Don't throw - just return
    return;
  }

  logger.info("Found order to mark as failed", {
    orderId: order.id,
    currentStatus: order.status,
    ledgerId: order.ledgerId,
  });

  // Update order and ledger in transaction
  try {
    await prismaPostgres.$transaction(async (tx) => {
      // ✅ FIX: Remove 'as any'
      await tx.ledgerEntry.update({
        where: { id: order.ledgerId! },
        data: {
          status: "FAILED",
          description: "Wallet topup failed",
          notes: failureReason,
          metadata: {
            failureCode,
            failureReason,
            accountId,
          },
        },
      });

      // Update payment order status
      await tx.paymentOrder.update({
        where: { id: order.id },
        data: {
          status: "FAILED",
          failureReason,
          failureCode,
        },
      });

      await enqueueOutboxEventTx(tx, {
        exchange: Exchanges.REALTIME_EVENTS,
        routingKey: RoutingKeys.REALTIME_TRANSACTION,
        payload: {
          userId: order.userId,
          transactionId: order.ledgerId,
          status: "FAILED",
          amount: amountStr,
          type: "WALLET_TOPUP",
        },
      });
    });

    await Promise.all([
      redis.del(RedisKeys.DASHBOARD_SUMMARY(order.userId)),
      redis.del(RedisKeys.DASHBOARD_FRESHNESS(order.userId)),
    ]);

    logger.info("❌ Payment marked as failed", {
      orderId: order.id,
      failureReason,
      failureCode,
    });
  } catch (error) {
    logger.error("Failed to update failed payment", {
      orderId: order.id,
      error,
    });
    // ✅ FIX: Don't rethrow - message will be acknowledged
    // This prevents infinite loops on database errors
  }
};
