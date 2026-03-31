import { enqueueOutboxEventTx, prismaPostgres } from "@repo/db-postgres";
import {
  ApiError,
  Currency,
  ErrorCodes,
  Logger,
  verifyPin,
  generateTransactionId,
} from "@repo/libs";
import { ENV } from "@repo/config";
import { Exchanges, RoutingKeys } from "@repo/rabbitmq";
import { invalidateCachePattern, redis, RedisKeys } from "@repo/redis";
import { withLock } from "@repo/redis";
import { nanoid } from "nanoid";

const logger = new Logger("RequestService");

const invalidateDashboardCaches = async (userIds: string[]) => {
  await Promise.all(
    Array.from(new Set(userIds)).map((userId) =>
      redis.del(RedisKeys.DASHBOARD_SUMMARY(userId)),
    ),
  );
};

const emitBalanceUpdateTx = async (
  tx: any,
  userId: string,
  balance: bigint,
  availableBalance: bigint,
) => {
  await enqueueOutboxEventTx(tx, {
    exchange: Exchanges.REALTIME_EVENTS,
    routingKey: RoutingKeys.REALTIME_BALANCE,
    payload: {
      userId,
      balance: Currency.toRupees(balance),
      availableBalance: Currency.toRupees(availableBalance),
    },
  });
};

const emitTransactionUpdateTx = async (
  tx: any,
  userId: string,
  transactionId: string,
  amount: bigint,
  type: string,
  status: "SUCCESS" | "FAILED" | "PENDING" = "SUCCESS",
) => {
  await enqueueOutboxEventTx(tx, {
    exchange: Exchanges.REALTIME_EVENTS,
    routingKey: RoutingKeys.REALTIME_TRANSACTION,
    payload: {
      userId,
      transactionId,
      status,
      amount: Currency.toRupees(amount),
      type,
    },
  });
};

// ============================================
// CREATE PAYMENT REQUEST
// ============================================
export const createPaymentRequest = async (
  requesterId: string,
  recipientIdentifier: string,
  amountStr: string,
  reason?: string,
) => {
  const amount = Currency.toPaise(amountStr);
  const minAmount = Currency.toPaise(ENV.MIN_P2P_AMOUNT);
  const maxAmount = Currency.toPaise(ENV.MAX_P2P_AMOUNT);

  if (!Currency.validate(amount, minAmount, maxAmount)) {
    throw new ApiError(
      400,
      "INVALID_AMOUNT",
      `Amount must be between ₹${ENV.MIN_P2P_AMOUNT} and ₹${ENV.MAX_P2P_AMOUNT}`,
    );
  }

  // Find recipient
  const recipient = await findRecipient(recipientIdentifier);

  if (!recipient) {
    throw new ApiError(404, "RECIPIENT_NOT_FOUND", "Recipient not found", {
      searchedBy: detectIdentifierType(recipientIdentifier),
      searchValue: recipientIdentifier,
    });
  }

  if (recipient.userId === requesterId) {
    throw new ApiError(
      400,
      ErrorCodes.CANNOT_SEND_TO_SELF,
      "Cannot request money from yourself",
    );
  }

  // Check if recipient wallet can receive
  if (!recipient.canReceive) {
    throw new ApiError(
      400,
      "RECIPIENT_CANNOT_RECEIVE",
      "Recipient cannot receive payments at this time",
      {
        recipientName: recipient.user.fullName,
        recipientStatus: recipient.status,
        reason: recipient.isFrozen ? "Account frozen" : "Account not active",
      },
    );
  }

  // Create payment request (expires in 7 days)
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);

  const request = await prismaPostgres.paymentRequest.create({
    data: {
      id: `req_${nanoid(21)}`,
      requesterId,
      requestedFromId: recipient.userId,
      amount,
      reason,
      status: "PENDING",
      expiresAt,
    },
    include: {
      requester: {
        select: {
          fullName: true,
          email: true,
        },
      },
      requestedFrom: {
        select: {
          fullName: true,
          email: true,
        },
      },
    },
  });

  await invalidateDashboardCaches([requesterId, recipient.userId]);

  logger.info("Payment request created", {
    requestId: request.id,
    requesterId,
    requestedFromId: recipient.userId,
  });

  return {
    requestId: request.id,
    amount: Currency.toRupees(amount),
    reason,
    recipient: {
      name: recipient.user.fullName,
      email: recipient.user.email,
    },
    status: "PENDING",
    expiresAt: request.expiresAt,
    createdAt: request.createdAt,
  };
};

// ============================================
// GET SENT REQUESTS (OUTGOING)
// ============================================
export const getSentRequests = async (
  userId: string,
  options: {
    status?: string;
    limit?: number;
    cursor?: string;
  },
) => {
  const { status, limit = 20, cursor } = options;

  const where: any = { requesterId: userId };

  if (
    status &&
    ["PENDING", "APPROVED", "REJECTED", "EXPIRED"].includes(status)
  ) {
    where.status = status;
  }

  if (cursor) {
    where.id = { lt: cursor };
  }

  // Note: Old requests are auto-expired via background job in worker-service

  const requests = await prismaPostgres.paymentRequest.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: limit + 1,
    include: {
      requestedFrom: {
        select: {
          fullName: true,
          email: true,
        },
      },
    },
  });

  const hasMore = requests.length > limit;
  if (hasMore) requests.pop();

  return {
    requests: requests.map((req) => ({
      requestId: req.id,
      requestedFrom: {
        name: req.requestedFrom.fullName,
        email: req.requestedFrom.email,
      },
      amount: Currency.toRupees(req.amount),
      reason: req.reason,
      status: req.status,
      expiresAt: req.expiresAt,
      respondedAt: req.respondedAt,
      createdAt: req.createdAt,
    })),
    nextCursor: requests[requests.length - 1]?.id,
    hasMore,
  };
};

// ============================================
// GET RECEIVED REQUESTS (INCOMING)
// ============================================
export const getReceivedRequests = async (
  userId: string,
  options: {
    status?: string;
    limit?: number;
    cursor?: string;
  },
) => {
  const { status, limit = 20, cursor } = options;

  const where: any = { requestedFromId: userId };

  if (
    status &&
    ["PENDING", "APPROVED", "REJECTED", "EXPIRED"].includes(status)
  ) {
    where.status = status;
  }

  if (cursor) {
    where.id = { lt: cursor };
  }

  // Note: Old requests are auto-expired via background job in worker-service

  const requests = await prismaPostgres.paymentRequest.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: limit + 1,
    include: {
      requester: {
        select: {
          fullName: true,
          email: true,
        },
      },
    },
  });

  const hasMore = requests.length > limit;
  if (hasMore) requests.pop();

  return {
    requests: requests.map((req) => ({
      requestId: req.id,
      requester: {
        name: req.requester.fullName,
        email: req.requester.email,
      },
      amount: Currency.toRupees(req.amount),
      reason: req.reason,
      status: req.status,
      expiresAt: req.expiresAt,
      respondedAt: req.respondedAt,
      createdAt: req.createdAt,
    })),
    nextCursor: requests[requests.length - 1]?.id,
    hasMore,
  };
};

// ============================================
// GET REQUEST DETAILS
// ============================================
export const getRequestDetails = async (userId: string, requestId: string) => {
  const request = await prismaPostgres.paymentRequest.findUnique({
    where: { id: requestId },
    include: {
      requester: {
        select: {
          fullName: true,
          email: true,
        },
      },
      requestedFrom: {
        select: {
          fullName: true,
          email: true,
        },
      },
    },
  });

  if (!request) {
    throw new ApiError(404, "REQUEST_NOT_FOUND", "Payment request not found");
  }

  // User must be either requester or recipient
  if (request.requesterId !== userId && request.requestedFromId !== userId) {
    throw new ApiError(
      403,
      "UNAUTHORIZED",
      "You don't have access to this request",
    );
  }

  // Auto-expire if needed
  const now = new Date();
  if (request.status === "PENDING" && request.expiresAt < now) {
    await prismaPostgres.paymentRequest.update({
      where: { id: requestId },
      data: { status: "EXPIRED" },
    });
    request.status = "EXPIRED";
  }

  return {
    requestId: request.id,
    requester: {
      name: request.requester.fullName,
      email: request.requester.email,
    },
    requestedFrom: {
      name: request.requestedFrom.fullName,
      email: request.requestedFrom.email,
    },
    amount: Currency.toRupees(request.amount),
    reason: request.reason,
    status: request.status,
    transferId: request.transferId,
    expiresAt: request.expiresAt,
    respondedAt: request.respondedAt,
    createdAt: request.createdAt,
    isRequester: request.requesterId === userId,
    isRecipient: request.requestedFromId === userId,
  };
};

// ============================================
// PAY REQUEST (WITH PIN)
// ============================================
export const payRequest = async (
  userId: string,
  requestId: string,
  pin: string,
) => {
  // Get request
  const request = await prismaPostgres.paymentRequest.findUnique({
    where: { id: requestId },
    include: {
      requester: {
        select: {
          id: true,
          fullName: true,
          email: true,
        },
      },
    },
  });

  if (!request) {
    throw new ApiError(404, "REQUEST_NOT_FOUND", "Payment request not found");
  }

  // Only recipient can pay
  if (request.requestedFromId !== userId) {
    throw new ApiError(403, "UNAUTHORIZED", "You cannot pay this request");
  }

  // Check status
  if (request.status !== "PENDING") {
    throw new ApiError(
      400,
      "INVALID_REQUEST_STATUS",
      `Request is already ${request.status}`,
    );
  }

  // Check expiry
  const now = new Date();
  if (request.expiresAt < now) {
    await prismaPostgres.paymentRequest.update({
      where: { id: requestId },
      data: { status: "EXPIRED" },
    });
    throw new ApiError(400, "REQUEST_EXPIRED", "This request has expired");
  }

  // Verify PIN
  const user = await prismaPostgres.user.findUnique({
    where: { id: userId },
    select: { hashedPin: true, fullName: true },
  });

  if (!user?.hashedPin) {
    throw new ApiError(400, "PIN_NOT_SET", "Please set your PIN first");
  }

  const isPinValid = await verifyPin(pin, user.hashedPin);

  if (!isPinValid) {
    throw new ApiError(400, ErrorCodes.INVALID_PIN, "Invalid PIN");
  }

  const amount = request.amount;
  const lockResource = `request:pay:${requestId}`;

  // Execute payment with lock
  const result = await withLock(lockResource, 10, async () => {
    return await executeRequestPayment(
      userId,
      request.requesterId,
      amount,
      requestId,
      request.reason || undefined,
    );
  });

  // Clear cache
  await Promise.all([
    redis.del(RedisKeys.WALLET_BALANCE(userId)),
    redis.del(RedisKeys.WALLET_BALANCE(request.requesterId)),
    invalidateCachePattern(RedisKeys.LEDGER_ANALYTICS_PATTERN(userId)),
    invalidateCachePattern(
      RedisKeys.LEDGER_ANALYTICS_PATTERN(request.requesterId),
    ),
    invalidateDashboardCaches([userId, request.requesterId]),
  ]);

  logger.info("Payment request paid", {
    requestId,
    transferId: result.transferId,
    payerId: userId,
    requesterId: request.requesterId,
  });

  return {
    requestId,
    transferId: result.transferId,
    status: "APPROVED",
    amount: Currency.toRupees(amount),
    requester: {
      name: request.requester.fullName,
      email: request.requester.email,
    },
    newBalance: Currency.toRupees(result.payerNewBalance),
    timestamp: new Date().toISOString(),
  };
};

// ============================================
// DECLINE REQUEST
// ============================================
export const declineRequest = async (userId: string, requestId: string) => {
  const request = await prismaPostgres.paymentRequest.findUnique({
    where: { id: requestId },
  });

  if (!request) {
    throw new ApiError(404, "REQUEST_NOT_FOUND", "Payment request not found");
  }

  // Only recipient can decline
  if (request.requestedFromId !== userId) {
    throw new ApiError(403, "UNAUTHORIZED", "You cannot decline this request");
  }

  // Check status
  if (request.status !== "PENDING") {
    throw new ApiError(
      400,
      "INVALID_REQUEST_STATUS",
      `Request is already ${request.status}`,
    );
  }

  await prismaPostgres.paymentRequest.update({
    where: { id: requestId },
    data: {
      status: "REJECTED",
      respondedAt: new Date(),
    },
  });

  await invalidateDashboardCaches([userId, request.requesterId]);

  logger.info("Payment request declined", { requestId, userId });

  return {
    requestId,
    status: "REJECTED",
    message: "Payment request declined successfully",
  };
};

// ============================================
// CANCEL REQUEST (BY REQUESTER)
// ============================================
export const cancelRequest = async (userId: string, requestId: string) => {
  const request = await prismaPostgres.paymentRequest.findUnique({
    where: { id: requestId },
  });

  if (!request) {
    throw new ApiError(404, "REQUEST_NOT_FOUND", "Payment request not found");
  }

  // Only requester can cancel
  if (request.requesterId !== userId) {
    throw new ApiError(403, "UNAUTHORIZED", "You cannot cancel this request");
  }

  // Can only cancel PENDING requests
  if (request.status !== "PENDING") {
    throw new ApiError(
      400,
      "INVALID_REQUEST_STATUS",
      `Cannot cancel ${request.status} request`,
    );
  }

  await prismaPostgres.paymentRequest.update({
    where: { id: requestId },
    data: {
      status: "REJECTED",
      respondedAt: new Date(),
    },
  });

  await invalidateDashboardCaches([userId, request.requestedFromId]);

  logger.info("Payment request cancelled", { requestId, userId });

  return {
    requestId,
    status: "CANCELLED",
    message: "Payment request cancelled successfully",
  };
};

// ============================================
// HELPER: EXECUTE REQUEST PAYMENT
// ============================================
async function executeRequestPayment(
  payerId: string,
  requesterId: string,
  amount: bigint,
  requestId: string,
  reason?: string,
) {
  return prismaPostgres.$transaction(
    async (tx) => {
      const [payer, requester] = await Promise.all([
        tx.wallet.findUniqueOrThrow({
          where: { userId: payerId },
          select: {
            balance: true,
            status: true,
            isFrozen: true,
            version: true,
          },
        }),
        tx.wallet.findUniqueOrThrow({
          where: { userId: requesterId },
          select: {
            balance: true,
            status: true,
            isFrozen: true,
            version: true,
          },
        }),
      ]);

      // Validate payer wallet
      if (payer.status !== "ACTIVE" || payer.isFrozen) {
        throw new ApiError(
          400,
          ErrorCodes.WALLET_NOT_ACTIVE,
          "Your wallet is not active",
        );
      }

      if (payer.balance < amount) {
        throw new ApiError(
          400,
          ErrorCodes.INSUFFICIENT_BALANCE,
          "Insufficient balance",
        );
      }

      // Validate requester wallet
      const canReceive =
        ["PENDING_KYC", "ACTIVE"].includes(requester.status) &&
        !requester.isFrozen;
      if (!canReceive) {
        throw new ApiError(
          400,
          "REQUESTER_CANNOT_RECEIVE",
          "Requester cannot receive money at this time",
        );
      }

      const payerNewBalance = payer.balance - amount;
      const requesterNewBalance = requester.balance + amount;

      const payerLedgerId = generateTransactionId("ledger");
      const requesterLedgerId = generateTransactionId("ledger");
      const transferId = generateTransactionId("p2p");

      // Create ledger entries
      await tx.ledgerEntry.createMany({
        data: [
          {
            id: payerLedgerId,
            userId: payerId,
            referenceId: `PAY_REQUEST_${nanoid(21)}`,
            entryType: "PAYMENT_REQUEST_PAID",
            amount: -amount,
            balanceBefore: payer.balance,
            balanceAfter: payerNewBalance,
            status: "SUCCESS",
            description: `Paid request`,
            relatedUserId: requesterId,
            metadata: { requestId, reason },
          },
          {
            id: requesterLedgerId,
            userId: requesterId,
            referenceId: `RECEIVE_REQUEST_${nanoid(21)}`,
            entryType: "PAYMENT_REQUEST_PAID",
            amount: amount,
            balanceBefore: requester.balance,
            balanceAfter: requesterNewBalance,
            status: "SUCCESS",
            description: `Request payment received`,
            relatedUserId: payerId,
            metadata: { requestId, reason },
          },
        ],
      });

      // Update wallets
      await Promise.all([
        tx.wallet.update({
          where: { userId: payerId },
          data: { balance: payerNewBalance, version: { increment: 1 } },
        }),
        tx.wallet.update({
          where: { userId: requesterId },
          data: { balance: requesterNewBalance, version: { increment: 1 } },
        }),
      ]);

      // Create transfer record
      await tx.p2PTransfer.create({
        data: {
          id: transferId,
          senderId: payerId,
          recipientId: requesterId,
          amount,
          note: reason,
          status: "SUCCESS",
          senderLedgerId: payerLedgerId,
          recipientLedgerId: requesterLedgerId,
          idempotencyKey: `req_pay_${requestId}`,
        },
      });

      // Update request status
      await tx.paymentRequest.update({
        where: { id: requestId },
        data: {
          status: "APPROVED",
          transferId,
          respondedAt: new Date(),
        },
      });

      await Promise.all([
        emitTransactionUpdateTx(
          tx,
          payerId,
          payerLedgerId,
          amount,
          "PAYMENT_REQUEST_PAID",
        ),
        emitTransactionUpdateTx(
          tx,
          requesterId,
          requesterLedgerId,
          amount,
          "PAYMENT_REQUEST_PAID",
        ),
        emitBalanceUpdateTx(tx, payerId, payerNewBalance, payerNewBalance),
        emitBalanceUpdateTx(
          tx,
          requesterId,
          requesterNewBalance,
          requesterNewBalance,
        ),
      ]);

      return {
        transferId,
        payerNewBalance,
      };
    },
    {
      isolationLevel: "Serializable",
      timeout: 10000,
    },
  );
}

// ============================================
// HELPER: FIND RECIPIENT
// ============================================
async function findRecipient(identifier: string) {
  const type = detectIdentifierType(identifier);

  let where: any = {};

  if (type === "email") {
    where = { email: identifier };
  } else if (type === "phone") {
    where = { phone: identifier };
  } else if (type === "wallet_id") {
    return prismaPostgres.wallet
      .findFirst({
        where: { qrCode: identifier },
        select: {
          userId: true,
          status: true,
          isFrozen: true,
          qrCode: true,
          user: { select: { fullName: true, email: true } },
        },
      })
      .then((wallet) => {
        if (!wallet) return null;
        return {
          ...wallet,
          canReceive:
            ["PENDING_KYC", "ACTIVE"].includes(wallet.status) &&
            !wallet.isFrozen,
        };
      });
  } else {
    return null;
  }

  const user = await prismaPostgres.user.findUnique({
    where,
    select: {
      id: true,
      fullName: true,
      email: true,
      wallet: {
        select: {
          userId: true,
          status: true,
          isFrozen: true,
          qrCode: true,
        },
      },
    },
  });

  if (!user?.wallet) return null;

  return {
    userId: user.wallet.userId,
    status: user.wallet.status,
    isFrozen: user.wallet.isFrozen,
    qrCode: user.wallet.qrCode,
    user: { fullName: user.fullName, email: user.email },
    canReceive:
      ["PENDING_KYC", "ACTIVE"].includes(user.wallet.status) &&
      !user.wallet.isFrozen,
  };
}

function detectIdentifierType(
  identifier: string,
): "email" | "phone" | "wallet_id" | "unknown" {
  if (identifier.toLowerCase().endsWith("@wallet")) return "wallet_id";
  if (identifier.includes("@")) return "email";
  if (identifier.startsWith("+")) return "phone";
  if (identifier.startsWith("WALLET_")) return "wallet_id";
  return "unknown";
}
