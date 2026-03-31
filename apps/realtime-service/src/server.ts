import { WebSocketServer, WebSocket } from "ws";
import { Logger } from "@repo/libs";
import { extractTokenFromUrl, verifyToken } from "./websocket/auth.js";
import { connectionManager } from "./websocket/connectionManager.js";
import { WSEventType } from "@repo/types";

const logger = new Logger("WebSocketServer");

export function createWebSocketServer(port: number) {
  const wss = new WebSocketServer({ port });

  wss.on("listening", () => {
    logger.info(`🚀 WebSocket server listening on port ${port}`);
  });

  wss.on("connection", (ws: WebSocket, req) => {
    const url = req.url || "";
    const token = extractTokenFromUrl(url);

    // verify authentication
    if (!token) {
      logger.warn("Connection rejected: No token provided");
      ws.close(1008, "Authentication required");
      return;
    }

    const user = verifyToken(token);
    if (!user) {
      logger.warn("Connection rejected: Invalid token");
      ws.close(1008, "Invalid token");
      return;
    }

    // add connection to manager
    connectionManager.addConnection(user.userId, ws);

    // send connection confirmation
    ws.send(
      JSON.stringify({
        type: WSEventType.CONNECTED,
        payload: {
          userId: user.userId,
          message: "Connected to realtime service",
        },
        timestamp: new Date().toISOString(),
      }),
    );

    // we are checking ping/pong to verify the connection is alive
    ws.on("pong", () => {
      logger.debug(`Pong received from user: ${user.userId}`);
    });

    // handle messages from client
    ws.on("message", (data) => {
      try {
        const message = JSON.parse(data.toString());
        logger.info(`Message from ${user.userId}:`, message);

        // just acknowledge
        ws.send(
          JSON.stringify({
            type: "ACK",
            payload: { received: true },
            timestamp: new Date().toISOString(),
          }),
        );
      } catch (error) {
        logger.error("Failed to parse message", error);
      }
    });

    // handle disconnection
    ws.on("close", () => {
      connectionManager.removeConnection(user.userId, ws);
      logger.info(`User disconnected: ${user.userId}`);
    });

    // handle errors
    ws.on("error", (error) => {
      logger.error(`WebSocket error for user ${user.userId}:`, error);
      connectionManager.removeConnection(user.userId, ws);
    });
  });

  // check ping/pong to verify the connection is alive in eveyr 30 secon
  const heartbeatInterval = setInterval(() => {
    wss.clients.forEach((ws) => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.ping();
      }
    });
  }, 30000);

  // cleanup on server close
  wss.on("close", () => {
    clearInterval(heartbeatInterval);
    logger.info("WebSocket server closed");
  });

  return wss;
}
