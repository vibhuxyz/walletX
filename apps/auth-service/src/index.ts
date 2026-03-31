import express, { Request, Response } from "express";
import cookieParser from "cookie-parser";
import { ENV } from "@repo/config";
import { Logger } from "@repo/libs";
import { errorHandler, requestIdMiddleware } from "@repo/http";

import { setupExchangeQueue } from "@repo/rabbitmq";
const app = express();
import registerRoutes from "./routes/register.routes.js";
import pinRoutes from "./routes/pin.routes.js";
import loginRoutes from "./routes/login.routes.js";
import deviceRoutes from "./routes/device.routes.js";
import passwordRoutes from "./routes/password.routes.js";
import uploadRoutes from "./routes/upload.routes.js";
import accountRoutes from "./routes/account.routes.js";

const logger = new Logger("AuthService");

// Read forwarded client IPs when traffic comes through API gateway / proxy.
app.set("trust proxy", true);

app.use(express.json({ limit: "1mb" }));
app.use(cookieParser(ENV.COOKIE_SECRET));
app.use(requestIdMiddleware);

app.get("/health", (req: Request, res: Response) => {
  res.json({ status: "ok", service: "auth-service" });
});

// routes
app.use("/api/v0/auth", registerRoutes);
app.use("/api/v0/auth", loginRoutes);
app.use("/api/v0/auth", pinRoutes);
app.use("/api/v0/auth", deviceRoutes);
app.use("/api/v0/auth", passwordRoutes);
app.use("/api/v0/auth", uploadRoutes);
app.use("/api/v0/auth", accountRoutes);

app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: {
      code: "NOT_FOUND",
      message: `auth Service Route not found: ${req.path}`,
    },
  });
});

app.use(errorHandler);

async function start() {
  try {
    // Setup RabbitMQ
    await setupExchangeQueue();

    const port = ENV.AUTH_SERVICE_PORT;

    app.listen(port, () => {
      console.log(`Auth Service running on port http://localhost:${port}`);
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
