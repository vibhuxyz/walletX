import express, { type Request, type Response } from "express";
import cookieParser from "cookie-parser";
import { Logger } from "@repo/libs";
import { errorHandler, requestIdMiddleware } from "@repo/http";
import { ENV } from "@repo/config";
import { setupExchangeQueue } from "@repo/rabbitmq";
import accountRoutes from "./routes/account.routes.js";
// import adminRoutes from "./routes/admin.routes.js";

import debitRoutes from "./routes/debit.routes.js";
const logger = new Logger("bank-service");

const app = express();

app.use(express.json({ limit: "1mb" }));
app.use(cookieParser(ENV.COOKIE_SECRET));
app.use(requestIdMiddleware);

app.get("/", (req: Request, res: Response) => {
  res.json({ status: "ok", service: "Bank-service" });
});

app.use("/api/v0/bank", accountRoutes);

app.use("/api/v0/bank", debitRoutes);

app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: {
      code: "NOT_FOUND",
      message: `Bank Service Route not found: ${req.path}`,
    },
  });
});

app.use(errorHandler);

async function start() {
  try {
    // Setup RabbitMQ
    await setupExchangeQueue();

    const port = ENV.BANK_SERVICE_PORT;

    app.listen(port, () => {
      console.log(`Bank Service running on port http://localhost:${port}`);
    });
  } catch (error) {
    logger.error("Failed to start Auth Service", error);
    process.exit(1);
  }
}

start();

process.on("SIGTERM", () => {
  logger.info("SIGTERM received, shutting down gracefully...");
  process.exit(0);
});







// app.use("/api/v0/bank", adminRoutes);
