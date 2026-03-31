import { ENV } from "@repo/config";
import { prismaPostgres } from "@repo/db-postgres";
import {
  ApiError,
  Currency,
  generateOTP,
  generateTransactionId,
  hashOTP,
  Logger,
  verifyOTP,
  verifyPin,
} from "@repo/libs";
import { Exchanges, publishMessage, RoutingKeys } from "@repo/rabbitmq";
import {
  invalidateWalletReadCaches,
  redis,
  RedisKeys,
  RedisTTL,
} from "@repo/redis";
import { nanoid } from "nanoid";

const logger = new Logger("topup Service");

export const initiateTopup = async (
  userId: string,
  linkedAccountId: string,
  amountStr: string,
  idempotencyKey: string,
) => {
  const amount = Currency.toPaise(amountStr);

  const minAmount = Currency.toPaise(ENV.MIN_TOPUP_AMOUNT);
  const maxAmount = Currency.toPaise(ENV.MAX_TOPUP_AMOUNT);

  if (!Currency.validate(amount, minAmount, maxAmount)) {
    throw new ApiError(
      400,
      "INVALID_AMOUNT",
      `Amount must be between ₹${ENV.MIN_TOPUP_AMOUNT} and ₹${ENV.MAX_TOPUP_AMOUNT}`,
    );
  }

  // Validate wallet exists and is active

  const wallet = await prismaPostgres.wallet.findUnique({
    where: { userId },
    select: { status: true, isFrozen: true },
  });

  if (!wallet) {
    throw new ApiError(404, "WALLET_NOT_FOUND", "Wallet not found");
  }
  if (wallet.status !== "ACTIVE") {
    throw new ApiError(400, "WALLET_NOT_ACTIVE", "Wallet is not active");
  }

  if (wallet.isFrozen) {
    throw new ApiError(400, "WALLET_FROZEN", "Wallet is frozen");
  }

  // Validate linked account
  const linkedAccount = await prismaPostgres.linkedBankAccount.findFirst({
    where: { id: linkedAccountId, userId },
    include: {
      account: {
        select: {
          id: true,
          bankName: true,
          accountNumber: true,
          accountType: true,
          status: true,
          balance: true,
          email: true,
        },
      },
    },
  });

  if (!linkedAccount) {
    throw new ApiError(404, "ACCOUNT_NOT_LINKED", "Bank account not linked");
  }
  if (linkedAccount.account.status !== "ACTIVE") {
    throw new ApiError(400, "ACCOUNT_NOT_ACTIVE", "Bank account is not active");
  }
  const user = await prismaPostgres.user.findUnique({
    where: { id: userId },
    select: { hashedPin: true },
  });

  if (!user?.hashedPin) {
    throw new ApiError(400, "PIN_NOT_SET", "Please set your PIN first");
  }
  // Create payment order
  const order = await prismaPostgres.paymentOrder.create({
    data: {
      id: `ord_${nanoid(21)}`,
      userId,
      accountId: linkedAccount.account.id,
      amount,
      status: "INITIATED",
      idempotencyKey,
    },
  });

  logger.info("Topup order created", {
    orderId: order.id,
    amount: Currency.toRupees(amount),
  });

  return {
    orderId: order.id,
    amount: Currency.toRupees(amount),
    status: "INITIATED",
    account: {
      bankName: linkedAccount.account.bankName,
      maskedAccount: linkedAccount.maskedAccount,
      accountType: linkedAccount.account.accountType,
    },
    message: "Please verify your PIN to proceed",
  };
};

export const verifyPinAndSendOTP = async (
  userId: string,
  orderId: string,
  pin: string,
) => {
  const order = await prismaPostgres.paymentOrder.findFirst({
    where: { id: orderId, userId, status: "INITIATED" },
    include: {
      account: {
        select: {
          id: true,
          bankName: true,
          accountNumber: true,
          accountType: true,
          status: true,
          email: true,
        },
      },
    },
  });

  if (!order) {
    throw new ApiError(404, "ORDER_NOT_FOUND", "Topup order not found");
  }
  if (order.userId !== userId) {
    throw new ApiError(403, "UNAUTHORIZED", "Order does not belong to you");
  }

  if (order.status !== "INITIATED") {
    throw new ApiError(
      400,
      "INVALID_ORDER_STATUS",
      `Order is already ${order.status}`,
    );
  }

  if (order.account.status !== "ACTIVE") {
    throw new ApiError(400, "ACCOUNT_NOT_ACTIVE", "Bank account is not active");
  }

  // Verify user's PIN
  const user = await prismaPostgres.user.findUnique({
    where: { id: userId },
    select: { hashedPin: true, fullName: true },
  });
  if (!user?.hashedPin) {
    throw new ApiError(400, "PIN_NOT_SET", "PIN not set");
  }

  const isPinValid = await verifyPin(pin, user.hashedPin);

  if (!isPinValid) {
    throw new ApiError(400, "INVALID_PIN", "Invalid PIN");
  }

  // Generate OTP
  const otp = generateOTP(6);
  const hashedOtp = await hashOTP(otp);

  await redis.set(
    RedisKeys.OTP_TOPUP(orderId),
    JSON.stringify({
      hashedOtp,
      attempts: 0,
      pinVerifiedAt: new Date().toISOString(),
    }),
    "EX",
    RedisTTL.OTP_TOPUP,
  );

  // Send OTP to bank's registered email
  await publishMessage(Exchanges.NOTIFICATIONS, RoutingKeys.EMAIL_TOPUP_OTP, {
    to: order.account.email,
    template: "topup-verification",
    data: {
      name: user.fullName,
      otp,
      amount: Currency.toRupees(order.amount),
      bankName: order.account.bankName,
      maskedAccount: `******${order.account.accountNumber.slice(-4)}`,
    },
  });

  await prismaPostgres.paymentOrder.update({
    where: { id: orderId },
    data: { status: "PENDING" },
  });
  logger.info("Topup OTP sent", { orderId, email: order.account.email });

  return {
    message: "OTP sent to your registered bank email",
    emailHint: `${order.account.email.slice(0, 3)}***@${order.account.email.split("@")[1]}`,
    expiresIn: 300,
  };
};

export const confirmTopupOTP = async (
  userId: string,
  orderId: string,
  otp: string,
) => {
  // Get order
  const order = await prismaPostgres.paymentOrder.findUnique({
    where: { id: orderId },
    include: {
      account: {
        select: {
          id: true,
          bankName: true,
          accountNumber: true,
          balance: true,
        },
      },
    },
  });

  if (!order) {
    throw new ApiError(404, "ORDER_NOT_FOUND", "Topup order not found");
  }

  if (order.userId !== userId) {
    throw new ApiError(403, "UNAUTHORIZED", "Order does not belong to you");
  }

  if (order.status !== "PENDING") {
    throw new ApiError(
      400,
      "INVALID_ORDER_STATUS",
      `Order is ${order.status}. Expected PENDING.`,
    );
  }

  const otpKey = RedisKeys.OTP_TOPUP(orderId);
  const otpData = await redis.get(otpKey);

  if (!otpData) {
    throw new ApiError(400, "OTP_EXPIRED", "OTP has expired");
  }

  const { hashedOtp, attempts } = JSON.parse(otpData);

  if (attempts >= 5) {
    await redis.del(otpKey);
    await prismaPostgres.paymentOrder.update({
      where: { id: orderId },
      data: {
        status: "FAILED",
        failureReason: "Maximum OTP attempts exceeded",
        failureCode: "MAX_OTP_ATTEMPTS",
      },
    });
    await invalidateWalletReadCaches([userId]);
    throw new ApiError(400, "MAX_ATTEMPTS", "Maximum OTP attempts exceeded");
  }

  const isOtpValid = await verifyOTP(otp, hashedOtp);

  if (!isOtpValid) {
    // Increment attempts
    await redis.setex(
      otpKey,
      300,
      JSON.stringify({ hashedOtp, attempts: attempts + 1 }), // Make sure to save back as hashedOtp
    );
    throw new ApiError(400, "INVALID_OTP", "Invalid OTP");
  }

  // ✅ OTP is valid - delete it
  await redis.del(otpKey);

  // ✅ Create PENDING ledger entry IMMEDIATELY
  const wallet = await prismaPostgres.wallet.findUniqueOrThrow({
    where: { userId },
    select: { balance: true, version: true },
  });

  const ledgerId = generateTransactionId("ledger");

  await prismaPostgres.ledgerEntry.create({
    data: {
      id: ledgerId,
      userId,
      referenceId: `TOPUP_${orderId}`,
      entryType: "WALLET_TOPUP",
      amount: order.amount,
      balanceBefore: wallet.balance,
      balanceAfter: wallet.balance, // Will update after bank success
      status: "PENDING", // ← PENDING status
      description: "Wallet topup - awaiting bank confirmation",
      orderId: orderId,
      metadata: {
        accountId: order.account.id,
        bankName: order.account.bankName,
        maskedAccount: `******${order.account.accountNumber.slice(-4)}`,
      },
    },
  });

  await prismaPostgres.paymentOrder.update({
    where: { id: orderId },
    data: {
      status: "PROCESSING",
      ledgerId: ledgerId,
    },
  });

  await invalidateWalletReadCaches([userId]);

  logger.info("OTP verified, creating pending ledger entry", {
    orderId,
    ledgerId,
  });

  callBankDebitAsync(order.account.id, order.amount.toString(), orderId).catch(
    (error) => {
      logger.error("Bank debit async call failed", { orderId, error });
    },
  );

  return {
    orderId,
    status: "PROCESSING",
    message: "Payment is being processed. You will be notified once completed.",
    amount: Currency.toRupees(order.amount),
  };
};

async function callBankDebitAsync(
  accountId: string,
  amount: string,
  referenceId: string,
) {
  try {
    const response = await fetch(`${ENV.BANK_SERVICE_URL}/api/v0/bank/debit`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-Key": ENV.WALLET_SERVICE_API_KEY,
      },
      body: JSON.stringify({
        accountId,
        amount,
        referenceId,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      logger.error("Bank debit failed", { accountId, referenceId, error });
    } else {
      logger.info("Bank debit initiated successfully", {
        accountId,
        referenceId,
      });
    }
  } catch (error) {
    logger.error("Bank debit API call failed", {
      accountId,
      referenceId,
      error,
    });
  }
}

export const getTopupStatus = async (userId: string, orderId: string) => {
  const order = await prismaPostgres.paymentOrder.findUnique({
    where: { id: orderId },
    include: {
      account: {
        select: {
          bankName: true,
          accountNumber: true,
        },
      },
    },
  });

  if (!order) {
    throw new ApiError(404, "ORDER_NOT_FOUND", "Topup order not found");
  }

  if (order.userId !== userId) {
    throw new ApiError(403, "UNAUTHORIZED", "Order does not belong to you");
  }

  return {
    orderId: order.id,
    amount: Currency.toRupees(order.amount),
    status: order.status,
    failureReason: order.failureReason,
    account: {
      bankName: order.account.bankName,
      maskedAccount: `******${order.account.accountNumber.slice(-4)}`,
    },
    createdAt: order.createdAt,
    updatedAt: order.updatedAt,
  };
};
