import { ENV } from "@repo/config";
import { Logger } from "@repo/libs";
import { setupExchangeQueue } from "@repo/rabbitmq";

import { startTransactionConsumer } from "./consumers/transaction.consumer.js";
import { startBalanceConsumer } from "./consumers/balance.consumer.js";
import { createWebSocketServer } from "./server.js";

const logger = new Logger("RealtimeService");

const resolveWebSocketPort = () => {
  try {
    const parsed = new URL(ENV.REALTIME_SERVICE_URL);
    const defaultPort = parsed.protocol === "https:" ? 443 : 80;
    const port = Number(parsed.port || defaultPort);

    if (Number.isNaN(port) || port <= 0) {
      throw new Error(`Invalid port extracted from ${ENV.REALTIME_SERVICE_URL}`);
    }

    return port;
  } catch (error) {
    logger.warn(`Falling back to default WebSocket port : ${ENV.REALTIME_SERVICE_PORT} `, {
      reason: error instanceof Error ? error.message : String(error),
    });
    return ENV.REALTIME_SERVICE_PORT;
  }
};

const WEBSOCKET_PORT = resolveWebSocketPort();

async function start() {
  try {
    logger.info("🚀 Starting Realtime Service...");

    // Setup RabbitMQ exchanges and queues
    await setupExchangeQueue();
    logger.info("✅ RabbitMQ setup complete");

    // start webSocket server
    createWebSocketServer(WEBSOCKET_PORT);
    logger.info(`✅ WebSocket server started on port ${WEBSOCKET_PORT}`);

    // start rabbitMQ consumers
    await startTransactionConsumer();
    logger.info("✅ Transaction consumer registered");

    await startBalanceConsumer();
    logger.info("✅ Balance consumer registered");

    logger.info("🎉 Realtime Service started successfully");
  } catch (error) {
    logger.error("❌ Failed to start Realtime Service", error);
    process.exit(1);
  }
}

start();

// graceful shutdown
process.on("SIGTERM", () => {
  logger.info("SIGTERM received, shutting down gracefully...");
  process.exit(0);
});

process.on("SIGINT", () => {
  logger.info("SIGINT received, shutting down gracefully...");
  process.exit(0);
});
