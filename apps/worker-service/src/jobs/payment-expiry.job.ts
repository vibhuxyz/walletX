import { prismaPostgres } from "@repo/db-postgres";
import { Logger } from "@repo/libs";

const logger = new Logger("PaymentExpiryJob");
const EXPIRY_INTERVAL_MS = 5 * 60 * 1000; // 5 minutes

async function expireRequests() {
  const now = new Date();
  
  const result = await prismaPostgres.paymentRequest.updateMany({
    where: {
      status: "PENDING",
      expiresAt: { lt: now },
    },
    data: {
      status: "EXPIRED",
    },
  });

  if (result.count > 0) {
    logger.info("Expired stale payment requests", { count: result.count });
  }
}

export function startPaymentExpiryJob() {
  const run = async () => {
    try {
      await expireRequests();
    } catch (error) {
      logger.error("Payment expiry job failed", error);
    }
  };

  void run();
  const timer = setInterval(() => {
    void run();
  }, EXPIRY_INTERVAL_MS);
  timer.unref();

  logger.info("Payment expiry job started", {
    intervalMs: EXPIRY_INTERVAL_MS,
  });
}
