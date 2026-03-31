import { consumeQueue, Queues } from "@repo/rabbitmq";
import { handleFailedDebit } from "../processors/wallet.processor.js";
import { Logger } from "@repo/libs";

const logger = new Logger("BankDebitFailedConsumer");

export async function startBankDebitFailedConsumer() {
  await consumeQueue(Queues.BANK_DEBIT_FAILED, async (message) => {
    try {
      logger.info("🔴 Received bank debit FAILED event", message);

      const { accountId, amount, referenceId, failureReason, failureCode } =
        message;

      // ✅ ADD: Validate message has all required fields
      if (
        !accountId ||
        !amount ||
        !referenceId ||
        !failureReason ||
        !failureCode
      ) {
        logger.error("Invalid FAILED event message - missing fields", message);
        return; // Acknowledge but don't process
      }

      await handleFailedDebit(
        accountId,
        amount,
        referenceId,
        failureReason,
        failureCode,
      );

      logger.info("✅ Payment failure processed successfully", {
        referenceId,
        failureCode,
      });
    } catch (error) {
      logger.error("❌ Failed to process debit failure", {
        message,
        error: error instanceof Error ? error.message : error,
      });
      // ✅ FIX: Don't rethrow - prevents infinite requeue on persistent errors
      // Uncomment next line if you want to requeue on errors:
      // throw error;
    }
  });

  logger.info("🚀 Bank debit FAILED consumer started and listening");
}
