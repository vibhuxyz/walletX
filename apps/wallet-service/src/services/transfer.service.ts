import {
  ApiError,
  Currency,
  ErrorCodes,
  generateTransactionId,
  Logger,
  verifyPin,
} from "@repo/libs";
import { ENV } from "@repo/config";
import {
  calculateAvailableBalance,
  detectIdentifierType,
  enqueueOutboxEventTx,
  findRecipient,
  prismaPostgres,
} from "@repo/db-postgres";
import { Exchanges, RoutingKeys } from "@repo/rabbitmq";
import { nanoid } from "nanoid";
import {
  invalidateCachePattern,
  redis,
  RedisKeys,
  withLock,
} from "@repo/redis";

const logger = new Logger("transfer-service");

const invalidateTransferReadCaches = async (
  senderId: string,
  recipientId: string,
) => {
  await Promise.all([
    redis.del(RedisKeys.WALLET_BALANCE(senderId)),
    redis.del(RedisKeys.WALLET_BALANCE(recipientId)),
    redis.del(RedisKeys.DASHBOARD_SUMMARY(senderId)),
    redis.del(RedisKeys.DASHBOARD_SUMMARY(recipientId)),
    redis.del(RedisKeys.RECENT_RECIPIENTS(senderId)),
    invalidateCachePattern(RedisKeys.LEDGER_ANALYTICS_PATTERN(senderId)),
    invalidateCachePattern(RedisKeys.LEDGER_ANALYTICS_PATTERN(recipientId)),
  ]);
};

// ₹500 in paise —> PIN required only above this

const PIN_THRESHOLD_PAISE = BigInt(50000);

export const validateP2PTransfer = async (
  senderId: string,
  amountStr: string,
  recipientIdentifier: string,
  note?: string,
) => {
  const amount = Currency.toPaise(amountStr);
  const minAmount = Currency.toPaise(ENV.MIN_P2P_AMOUNT);
  const maxAmount = Currency.toPaise(ENV.MAX_P2P_AMOUNT);

  if (!Currency.validate(amount, minAmount, maxAmount)) {
    throw new ApiError(
      401,
      "INVALID_AMOUNT",
      `Amount must be between ₹${ENV.MIN_P2P_AMOUNT} and ₹${ENV.MAX_P2P_AMOUNT}`,
    );
  }

  const sender = await prismaPostgres.wallet.findUnique({
    where: { userId: senderId },
    select: {
      balance: true,
      status: true,
      isFrozen: true,
      version: true,
      user: { select: { fullName: true, email: true } },
    },
  });

  if (!sender) {
    throw new ApiError(404, "WALLET_NOT_FOUND", "Wallet not found");
  }

  const availableBalance = calculateAvailableBalance(sender);

  if (!availableBalance.canSend) {
    throw new ApiError(
      400,
      ErrorCodes.WALLET_NOT_ACTIVE,
      "Wallet cannot send money",
      {
        currentStatus: sender.status,
        totalBalance: availableBalance.totalBalance,
        lockedBalance: availableBalance.lockedBalance,
        action: "Complete KYC to activate wallet",
      },
    );
  }

  if (sender.balance < amount) {
    throw new ApiError(
      400,
      ErrorCodes.INSUFFICIENT_BALANCE,
      "Insufficient wallet balance",
      {
        required: Currency.toRupees(amount),
        available: availableBalance.availableBalance,
        locked: availableBalance.lockedBalance,
        reason:
          sender.status === "PENDING_KYC"
            ? "Complete KYC to unlock funds"
            : undefined,
      },
    );
  }

  const recipient = await findRecipient(recipientIdentifier);

  if (!recipient) {
    throw new ApiError(404, "RECIPIENT_NOT_FOUND", "Recipient not found", {
      searchBy: detectIdentifierType(recipientIdentifier),
      searchValue: recipientIdentifier,
    });
  }

  if (recipient.userId === senderId) {
    throw new ApiError(
      400,
      ErrorCodes.CANNOT_SEND_TO_SELF,
      "Cannot send money to yourself",
    );
  }

  if (!recipient.canReceive) {
    throw new ApiError(
      400,
      "RECIPIENT_CANNOT_RECEIVE",
      "Recipient cannot receive money at this time",
      {
        recipientName: recipient.user.fullName,
        recipientStatus: recipient.status,
        reason: recipient.isFrozen ? "Account frozen" : "Account not active",
      },
    );
  }

  // ── Determine PIN requirement based on amount ──────────────────────────────
  const requiresPin = BigInt(amount) > PIN_THRESHOLD_PAISE;

  const transferId = `transfer_${nanoid(21)}`;

  await redis.set(
    RedisKeys.PENDING_TRANSFER(transferId),
    JSON.stringify({
      senderId,
      recipientId: recipient.userId,
      amount: amount.toString(),
      note,
      requiresPin, //  persisted so confirm can verify
      senderVersion: sender.version,
      createdAt: new Date().toISOString(),
    }),
    "EX",
    300,
  );

  logger.info("Transfer validated", {
    transferId,
    senderId,
    recipientId: recipient.userId,
    requiresPin,
  });

  return {
    transferId,
    requiresPin, // ← returned to frontend
    recipient: {
      name: recipient.user.fullName,
      email: recipient.user.email,
      qrCode: recipient.qrCode,
    },
    transaction: {
      amount: Currency.toRupees(amount),
      fee: "0.00",
      total: Currency.toRupees(amount),
      newBalance: Currency.toRupees(sender.balance - amount),
    },
    expiresIn: 300,
  };
};

export const confirmP2PTransfer = async (
  senderId: string,
  transferId: string,
  pin: string,
  idempotencyKey: string,
) => {
  const pendingTransferData = await redis.get(
    RedisKeys.PENDING_TRANSFER(transferId),
  );

  if (!pendingTransferData) {
    throw new ApiError(404, "TRANSFER_NOT_FOUND", "Transfer not found", {
      transferId,
      action: "Please validate transfer again",
    });
  }

  const pendingTransfer = JSON.parse(pendingTransferData);

  if (pendingTransfer.senderId !== senderId) {
    throw new ApiError(403, "UNAUTHORIZED", "Unauthorized transfer");
  }

  // ── PIN is only verified when amount was above ₹500 ───────────────────────
  if (pendingTransfer.requiresPin) {
    if (!pin) {
      throw new ApiError(
        400,
        "PIN_REQUIRED",
        "PIN is required for transfers above ₹500",
      );
    }

    const user = await prismaPostgres.user.findUnique({
      where: { id: senderId },
      select: { hashedPin: true, fullName: true },
    });

    if (!user?.hashedPin) {
      throw new ApiError(400, "PIN_NOT_SET", "Please set a PIN first");
    }

    const isPinValid = await verifyPin(pin, user.hashedPin);
    if (!isPinValid) {
      throw new ApiError(400, ErrorCodes.INVALID_PIN, "Invalid PIN");
    }
  }
  // ── For amounts ≤ ₹500: skip PIN entirely ─────────────────────────────────

  const amount = BigInt(pendingTransfer.amount);
  const recipientId = pendingTransfer.recipientId;
  const lockResource = `transfer:${senderId}:${recipientId}`;

  const result = await withLock(lockResource, 10, async () => {
    return await executeTransfer(
      senderId,
      recipientId,
      amount,
      pendingTransfer.note,
      idempotencyKey,
      pendingTransfer.senderVersion,
    );
  });

  await redis.del(RedisKeys.PENDING_TRANSFER(transferId));
  await invalidateTransferReadCaches(senderId, recipientId);

  logger.info("Transfer completed", { transferId, transactionId: result.id });

  return {
    transactionId: result.id,
    status: "SUCCESS",
    amount: Currency.toRupees(amount),
    recipient: {
      name: result.recipientName,
      email: result.recipientEmail,
    },
    newBalance: Currency.toRupees(result.senderNewBalance),
    timestamp: result.createdAt.toISOString(),
  };
};

export const executeTransfer = async (
  senderId: string,
  recipientId: string,
  amount: bigint,
  note: string | undefined,
  idempotencyKey: string,
  expectedSenderVersion: number,
) => {
  return prismaPostgres.$transaction(
    async (tx) => {
      const [sender, recipient] = await Promise.all([
        tx.wallet.findUniqueOrThrow({
          where: { userId: senderId },
          select: {
            balance: true,
            status: true,
            isFrozen: true,
            version: true,
            user: { select: { fullName: true } },
          },
        }),
        tx.wallet.findUniqueOrThrow({
          where: { userId: recipientId },
          select: {
            balance: true,
            status: true,
            isFrozen: true,
            version: true,
            user: { select: { fullName: true, email: true } },
          },
        }),
      ]);

      if (sender.version !== expectedSenderVersion) {
        throw new ApiError(
          409,
          "BALANCE_CHANGED",
          "Balance has changed since validation",
          {
            action: "Please validate transfer again",
          },
        );
      }

      if (sender.status !== "ACTIVE" || sender.isFrozen) {
        throw new ApiError(
          400,
          ErrorCodes.WALLET_NOT_ACTIVE,
          "Wallet is not active",
        );
      }

      if (sender.balance < amount) {
        throw new ApiError(
          400,
          ErrorCodes.INSUFFICIENT_BALANCE,
          "Insufficient balance",
        );
      }

      const canReceive =
        ["PENDING_KYC", "ACTIVE"].includes(recipient.status) &&
        !recipient.isFrozen;
      if (!canReceive) {
        throw new ApiError(
          400,
          "RECIPIENT_CANNOT_RECEIVE",
          "Recipient cannot receive money",
        );
      }

      const senderNewBalance = sender.balance - amount;
      const recipientNewBalance = recipient.balance + amount;
      const senderLedgerId = generateTransactionId("ledger");
      const recipientLedgerId = generateTransactionId("ledger");

      await tx.ledgerEntry.createMany({
        data: [
          {
            id: senderLedgerId,
            userId: senderId,
            referenceId: `P2P_SEND_${nanoid(21)}`,
            entryType: "P2P_SEND",
            amount: -amount,
            balanceBefore: sender.balance,
            balanceAfter: senderNewBalance,
            description: `Sent to ${recipient.user.fullName}`,
            relatedUserId: recipientId,
            metadata: { note },
            status: "SUCCESS",
          },
          {
            id: recipientLedgerId,
            userId: recipientId,
            referenceId: `P2P_RECEIVE_${nanoid(21)}`,
            entryType: "P2P_RECEIVE",
            amount: amount,
            balanceBefore: recipient.balance,
            balanceAfter: recipientNewBalance,
            description: `Received from ${sender.user.fullName}`,
            relatedUserId: senderId,
            metadata: { note },
            status: "SUCCESS",
          },
        ],
      });

      await Promise.all([
        tx.wallet.update({
          where: { userId: senderId },
          data: { balance: senderNewBalance, version: { increment: 1 } },
        }),
        tx.wallet.update({
          where: { userId: recipientId },
          data: { balance: recipientNewBalance, version: { increment: 1 } },
        }),
      ]);

      const transfer = await tx.p2PTransfer.create({
        data: {
          id: generateTransactionId("p2p"),
          senderId,
          recipientId,
          amount,
          note,
          status: "SUCCESS",
          senderLedgerId,
          recipientLedgerId,
          idempotencyKey,
        },
      });

      await enqueueOutboxEventTx(tx, {
        exchange: Exchanges.REALTIME_EVENTS,
        routingKey: RoutingKeys.REALTIME_TRANSACTION,
        payload: {
          userId: senderId,
          transactionId: transfer.id,
          status: "SUCCESS",
          amount: Currency.toRupees(amount),
          type: "P2P_SEND",
        },
      });

      await enqueueOutboxEventTx(tx, {
        exchange: Exchanges.REALTIME_EVENTS,
        routingKey: RoutingKeys.REALTIME_TRANSACTION,
        payload: {
          userId: recipientId,
          transactionId: transfer.id,
          status: "SUCCESS",
          amount: Currency.toRupees(amount),
          type: "P2P_RECEIVE",
        },
      });

      await enqueueOutboxEventTx(tx, {
        exchange: Exchanges.REALTIME_EVENTS,
        routingKey: RoutingKeys.REALTIME_BALANCE,
        payload: {
          userId: senderId,
          balance: Currency.toRupees(senderNewBalance),
          availableBalance: Currency.toRupees(senderNewBalance),
        },
      });

      await enqueueOutboxEventTx(tx, {
        exchange: Exchanges.REALTIME_EVENTS,
        routingKey: RoutingKeys.REALTIME_BALANCE,
        payload: {
          userId: recipientId,
          balance: Currency.toRupees(recipientNewBalance),
          availableBalance: Currency.toRupees(recipientNewBalance),
        },
      });

      return {
        id: transfer.id,
        senderNewBalance,
        recipientName: recipient.user.fullName,
        recipientEmail: recipient.user.email,
        createdAt: transfer.createdAt,
      };
    },
    { isolationLevel: "Serializable", timeout: 10000 },
  );
};
