import { consumeQueue, Queues } from "@repo/rabbitmq";
import { creditWallet } from "../processors/wallet.processor.js";
import { Logger } from "@repo/libs";

const logger = new Logger("BankDebitConsumer");

export async function startBankDebitConsumer() {
  await consumeQueue(Queues.BANK_DEBIT_SUCCESS, async (message) => {
    try {
      logger.info("Received bank debit event", message);

      const { accountId, amount, referenceId } = message;
      await creditWallet(accountId, amount, referenceId);

      logger.info("Wallet credited successfully", {
        accountId,
        amount,
        referenceId,
      });
    } catch (error) {
      logger.error("Failed to credit wallet", error);
      throw error; // Requeue message
    }
  });

  logger.info("Bank debit consumer started - listening for bank debit events");
}
