import { Express, Request, Response } from "express";
import { createProxyMiddleware, Options } from "http-proxy-middleware";
import { ENV } from "@repo/config";
import { Logger } from "@repo/libs";
import http from "http";

const logger = new Logger("ServiceProxy");

// Reuse upstream connections to avoid per-request TCP/TLS churn.
const proxyHttpAgent = new http.Agent({
  keepAlive: true,
  maxSockets: 100,
  keepAliveMsecs: 3000,
});

const serviceUnavailable = (res: Response) => {
  res
    .status(503)
    .json({ success: false, error: { code: "SERVICE_UNAVAILABLE" } });
};

const applyCommonProxyHeaders = (proxyReq: any) => {
  proxyReq.setHeader("ngrok-skip-browser-warning", "true");
};

const createServiceProxy = (
  target: string,
  pathRewrite: Record<string, string>,
  serviceName: string,
) =>
  createProxyMiddleware({
    target,
    changeOrigin: true,
    xfwd: true,
    pathRewrite,
    agent: proxyHttpAgent,
    onProxyReq: (proxyReq: any) => {
      applyCommonProxyHeaders(proxyReq);
    },
    onError: (err: any, _req: Request, res: Response) => {
      logger.error(`${serviceName} proxy error`, err);
      serviceUnavailable(res);
    },
  } as Options);

export const wsProxyMiddleware = createProxyMiddleware({
  target: ENV.REALTIME_SERVICE_URL,
  changeOrigin: true,
  xfwd: true,
  ws: true,
  pathRewrite: {
    "^/ws": "",
  },
} as Options);

export function setupProxies(app: Express) {
  app.use(
    "/api/v0/auth",
    createServiceProxy(
      ENV.AUTH_SERVICE_URL,
      {
        "^/": "/api/v0/auth/",
      },
      "Auth service",
    ),
  );

  app.use(
    "/api/v0/wallet",
    createServiceProxy(
      ENV.WALLET_SERVICE_URL,
      {
        "^/": "/api/v0/wallet/",
      },
      "Wallet service",
    ),
  );

  app.use(
    "/api/v0/bank",
    createServiceProxy(
      ENV.BANK_SERVICE_URL,
      {
        "^/": "/api/v0/bank/",
      },
      "Bank service",
    ),
  );

  app.use(
    "/api/v1/merchant",
    createServiceProxy(
      ENV.MERCHANT_SERVICE_URL,
      {
        "^/api/v1/merchant": "/api/v1/merchant",
      },
      "Merchant service",
    ),
  );

  app.use("/ws", wsProxyMiddleware);

  logger.info("Service proxies configured");
}
