import { prismaPostgres } from "@repo/db-postgres";
import { ApiError, Currency, Logger } from "@repo/libs";
import { Exchanges, publishMessage, RoutingKeys } from "@repo/rabbitmq";

const logger = new Logger("DebitService");

interface DebitResult {
  success: boolean;
  accountId: string;
  amount: string;
  referenceId: string;
  failureReason?: string;
  failureCode?: string;
}

export const debitAccount = async (
  accountId: string,
  amountStr: string,
  referenceId: string,
): Promise<DebitResult> => {
  const amount = BigInt(amountStr);

  logger.info("Processing bank debit", {
    accountId,
    amount: amountStr,
    referenceId,
  });

  try {
    const account = await prismaPostgres.bankAccount.findUnique({
      where: { id: accountId },
      select: {
        id: true,
        balance: true,
        status: true,
        isFrozen: true,
        version: true,
        accountNumber: true,
        bankName: true,
      },
    });

    if (!account) {
      const error: DebitResult = {
        success: false,
        accountId,
        amount: amountStr,
        referenceId,
        failureReason: "Bank account not found",
        failureCode: "ACCOUNT_NOT_FOUND",
      };

      await publishMessage(
        Exchanges.BANK_EVENTS,
        RoutingKeys.BANK_DEBIT_FAILED,
        error,
      );

      return error;
    }
    // ✅ Check if account is active
    if (account.status !== "ACTIVE") {
      const error: DebitResult = {
        success: false,
        accountId,
        amount: amountStr,
        referenceId,
        failureReason: "Bank account is not active",
        failureCode: "ACCOUNT_NOT_ACTIVE",
      };

      await publishMessage(
        Exchanges.BANK_EVENTS,
        RoutingKeys.BANK_DEBIT_FAILED,
        error,
      );

      return error;
    }

    // ✅ Check if account is frozen
    if (account.isFrozen) {
      const error: DebitResult = {
        success: false,
        accountId,
        amount: amountStr,
        referenceId,
        failureReason: "Bank account is frozen",
        failureCode: "ACCOUNT_FROZEN",
      };

      await publishMessage(
        Exchanges.BANK_EVENTS,
        RoutingKeys.BANK_DEBIT_FAILED,
        error,
      );

      return error;
    }

    // ✅ Check sufficient balance
    if (account.balance < amount) {
      const error: DebitResult = {
        success: false,
        accountId,
        amount: amountStr,
        referenceId,
        failureReason: `Insufficient balance. Available: ₹${Currency.toRupees(account.balance)}, Required: ₹${Currency.toRupees(amount)}`,
        failureCode: "INSUFFICIENT_BALANCE",
      };

      logger.warn("Insufficient balance", {
        accountId,
        available: Currency.toRupees(account.balance),
        required: Currency.toRupees(amount),
      });

      await publishMessage(
        Exchanges.BANK_EVENTS,
        RoutingKeys.BANK_DEBIT_FAILED,
        error,
      );

      return error;
    }

    // Debit account with optimistic locking
    const updated = await prismaPostgres.bankAccount.updateMany({
      where: {
        id: accountId,
        version: account.version,
      },
      data: {
        balance: { decrement: amount },
        version: { increment: 1 },
      },
    });

    if (updated.count === 0) {
      const error: DebitResult = {
        success: false,
        accountId,
        amount: amountStr,
        referenceId,
        failureReason: "Concurrent update detected. Please retry.",
        failureCode: "CONCURRENT_UPDATE",
      };

      await publishMessage(
        Exchanges.BANK_EVENTS,
        RoutingKeys.BANK_DEBIT_FAILED,
        error,
      );

      return error;
    }

    logger.info("Bank account debited successfully", {
      accountId,
      amount: Currency.toRupees(amount),
      referenceId,
    });

    // ✅ Publish success event
    const success: DebitResult = {
      success: true,
      accountId,
      amount: amountStr,
      referenceId,
    };

    await publishMessage(
      Exchanges.BANK_EVENTS,
      RoutingKeys.BANK_DEBIT_SUCCESS,
      success,
    );

    return success;
  } catch (err) {
    logger.error("Bank debit failed with exception", {
      accountId,
      referenceId,
      err,
    });

    const failureResult: DebitResult = {
      success: false,
      accountId,
      amount: amountStr,
      referenceId,
      failureReason: "Internal bank error occurred",
      failureCode: "INTERNAL_ERROR",
    };

    await publishMessage(
      Exchanges.BANK_EVENTS,
      RoutingKeys.BANK_DEBIT_FAILED,
      failureResult,
    );

    return failureResult;
  }
};
