import { Logger } from "@repo/libs";
import { processOutboxBatch } from "../services/outbox.service.js";

const logger = new Logger("OutboxDispatcherJob");
const OUTBOX_INTERVAL_MS = 5_000;

export function startOutboxDispatcherJob() {
  let isRunning = false;

  const run = async () => {
    if (isRunning) {
      return;
    }

    isRunning = true;
    try {
      await processOutboxBatch(20);
    } catch (error) {
      logger.error("Outbox dispatcher tick failed", error);
    } finally {
      isRunning = false;
    }
  };

  void run();
  const timer = setInterval(() => {
    void run();
  }, OUTBOX_INTERVAL_MS);
  timer.unref();

  logger.info("Outbox dispatcher job started", {
    intervalMs: OUTBOX_INTERVAL_MS,
  });
}
