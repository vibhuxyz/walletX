import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import { ENV } from "@repo/config";
import { setupRateLimiting } from "./middlewares/rateLimit.middleware.js";
import { setupProxies, wsProxyMiddleware } from "./proxy/serviceProxy.js";
import { errorHandler, requestIdMiddleware } from "@repo/http";
import { Logger } from "@repo/libs";
import express from "express";
import compression from "compression";
import { loggingMiddleware } from "./middlewares/logging.middleware.js";

const app = express();

const logger = new Logger("APIGateway");

// Preserve real client IP when behind reverse proxies / tunnels.
app.set("trust proxy", true);

// global middlewares apply to everything
// 
// 
// 
// 
// 
// 
//  
// they expresss
app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
  }),
);

app.use(
  cors({
    origin: ENV.FRONTEND_URL,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "X-Device-Id",
      "X-Device-Name",
      "X-CSRF-Token",
      "Idempotency-Key",
      "X-Request-ID",
      "X-Partner-Key",
      "X-Partner-Secret",
      "X-WalletX-Service-Key",
    ],
    exposedHeaders: ["X-Request-ID"],
  }),
);

// Compression
app.use(compression());
app.use(cookieParser(ENV.COOKIE_SECRET));

//   track & logg needs to run before proxy logs it
app.use(requestIdMiddleware);
app.use(loggingMiddleware);

// rate limiting needs to run before forwarding to protect your services
setupRateLimiting(app);

// after the rate liniting its doing proxy
setupProxies(app);

//  body parsers only runs for gateway specific routes like /health
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "100mb", extended: true }));

app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    service: "api-gateway",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

app.use(errorHandler);

app.use((req, res) => {
  res.status(404).json({
    error: {
      message: "Route not found",
      path: req.path,
    },
    meta: {
      requestId: req.requestId || "unknown",
      timestamp: new Date().toISOString(),
    },
  });
});

const port = ENV.API_GATEWAY_PORT;

const server = app.listen(port, () => {
  logger.info(`API Gateway running  http://localhost:${port}`);
});

process.on("SIGTERM", () => {
  logger.info("SIGTERM received, shutting down gracefully...");
  process.exit(0);
});

server.on("upgrade", (req, socket, head) => {
  if (req.url?.startsWith("/ws")) {
    wsProxyMiddleware.upgrade!(req, socket as any, head);
  } else {
    // If it's not a /ws request, destroy the socket to prevent hanging connections
    socket.destroy();
  }
});
