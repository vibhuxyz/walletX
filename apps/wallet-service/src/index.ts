import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { ENV } from "@repo/config";
import { errorHandler, requestIdMiddleware } from "@repo/http";
import { Logger } from "@repo/libs";
import transferRoutes from "./routes/transfer.routes.js";
import kycRoutes from "./routes/kyc.routes.js";
import walletRoutes from "./routes/wallet.routes.js";
import topupRoutes from "./routes/topup.routes.js";
import requestRoutes from "./routes/request.routes.js";
import ledgerRoutes from "./routes/ledger.routes.js";
import wsRoutes from "./routes/auth.routes.js";
import connectRoutes from "./routes/connect.routes.js";

const logger = new Logger("wallet-service");

const app = express();

app.use(express.json({ limit: "1mb" }));

app.use(cookieParser(ENV.COOKIE_SECRET));

app.use(requestIdMiddleware);

app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok", service: "wallet-service" });
});

//  route
app.use("/api/v0/wallet", kycRoutes);
app.use("/api/v0/wallet", transferRoutes);
app.use("/api/v0/wallet", walletRoutes);
app.use("/api/v0/wallet", topupRoutes);
app.use("/api/v0/wallet", requestRoutes);
app.use("/api/v0/wallet", ledgerRoutes);
app.use("/api/v0/wallet", wsRoutes);
app.use("/api/v1/connect", connectRoutes);

//
//
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: {
      code: "NOT_FOUND",
      message: `Wallet Service Route not found: ${req.path}`,
    },
  });
});

app.use(errorHandler);

const port = ENV.WALLET_SERVICE_PORT;

app.listen(port, () => {
  logger.info(`Wallet Service running on port ${port}`);
});

process.on("SIGTERM", () => {
  logger.info("SIGTERM received, shutting down gracefully...");
  process.exit(0);
});
