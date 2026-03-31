import { Logger } from "@repo/libs";
import { setupExchangeQueue } from "@repo/rabbitmq"; // ← Fix function name
import { startEmailConsumer } from "./consumers/email.consumer.js"; // ← Add .js
import { startBankDebitConsumer } from "./consumers/bankDebit.consumer.js"; // ← Add .js
import { startBankDebitFailedConsumer } from "./consumers/bankDebitFailed.consumer.js"; // ← Add .js
import { startDlqAlertConsumer } from "./consumers/dlqAlert.consumer.js";
import { startOutboxDispatcherJob } from "./jobs/outbox-dispatcher.job.js";
import { startBankReconciliationJob } from "./jobs/bank-reconciliation.job.js";
import { startPaymentExpiryJob } from "./jobs/payment-expiry.job.js";
import { startAnalyticsRefreshJob } from "./jobs/analytics-refresh.job.js";

const logger = new Logger("WorkerService");

async function start() {
  try {
    logger.info("🚀 Starting Worker Service...");

    // Setup RabbitMQ - CORRECT FUNCTION NAME
    await setupExchangeQueue();
    logger.info("✅ RabbitMQ setup complete");

    // Start consumers
    await startEmailConsumer();
    logger.info("✅ Email consumer registered");

    await startBankDebitConsumer();
    logger.info("✅ Bank debit SUCCESS consumer registered");

    await startBankDebitFailedConsumer();
    logger.info("✅ Bank debit FAILED consumer registered");

    await startDlqAlertConsumer();
    logger.info("✅ DLQ alert consumer registered");

    startOutboxDispatcherJob();
    logger.info("✅ Outbox dispatcher job started");

    startBankReconciliationJob();
    logger.info("✅ Bank reconciliation job started");

    startPaymentExpiryJob();
    logger.info("✅ Payment expiry job started");

    startAnalyticsRefreshJob();
    logger.info("✅ Analytics refresh job started");

    logger.info(
      "🎉 Worker Service started successfully - All consumers active",
    );
  } catch (error) {
    logger.error("❌ Failed to start Worker Service", error);
    console.error(error); // ← Add console.error to see the actual error
    process.exit(1);
  }
}

start();

process.on("SIGTERM", () => {
  logger.info("SIGTERM received, shutting down gracefully...");
  process.exit(0);
});

process.on("unhandledRejection", (reason, promise) => {
  logger.error("Unhandled Rejection at:", { promise, reason });
});
