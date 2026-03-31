import { WebSocket } from "ws";
import { Logger } from "@repo/libs";
import type { WSEvent } from "@repo/types";

const logger = new Logger("ConnectionManager");

// manage the connection for user
class ConnectionManager {
  // map of user id send of connection
  private connections: Map<string, Set<WebSocket>> = new Map();

  // added connection for the user
  addConnection(userId: string, ws: WebSocket): void {
    if (!this.connections.has(userId)) {
      this.connections.set(userId, new Set());
    }
    this.connections.get(userId)!.add(ws);
    logger.info(
      `User connected: ${userId}, Total connections: ${this.connections.get(userId)!.size}`,
    );
  }

  // remove connection for the user
  removeConnection(userId: string, ws: WebSocket): void {
    const userConnections = this.connections.get(userId);
    if (userConnections) {
      userConnections.delete(ws);
      logger.info(
        `User disconnected: ${userId}, Remaining connections: ${userConnections.size}`,
      );

      // clean the connect if no user found
      if (userConnections.size === 0) {
        this.connections.delete(userId);
        logger.info(`Removed user from connection map: ${userId}`);
      }
    }
  }

  // send event to all connections of a specific user
  sendToUser(userId: string, event: WSEvent): void {
    const userConnections = this.connections.get(userId);
    if (!userConnections || userConnections.size === 0) {
      logger.debug(`No active connections for user: ${userId}`);
      return;
    }

    const message = JSON.stringify(event);
    let sentCount = 0;

    userConnections.forEach((ws) => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(message);
        sentCount++;
      }
    });

    logger.info(
      `Event sent to user ${userId}: ${event.type}, connections: ${sentCount}`,
    );
  }

  // send events to multiple users
  sendToUsers(userIds: string[], event: WSEvent): void {
    userIds.forEach((userId) => this.sendToUser(userId, event));
  }
  // boradcats evet to alll connected users
  broadcast(event: WSEvent): void {
    const message = JSON.stringify(event);
    let sentCount = 0;

    this.connections.forEach((userConnections) => {
      userConnections.forEach((ws) => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(message);
          sentCount++;
        }
      });
    });

    logger.info(
      `Broadcast event: ${event.type}, sent to ${sentCount} connections`,
    );
  }

  // get total no of connected users
  getConnectedUserCount(): number {
    return this.connections.size;
  }

  //get total no of websocket connectiosns
  getTotalConnectionCount(): number {
    let total = 0;
    this.connections.forEach((connections) => {
      total += connections.size;
    });
    return total;
  }
}

export const connectionManager = new ConnectionManager();
