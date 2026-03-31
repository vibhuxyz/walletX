"use client";

import { WSEvent, WSEventType, ConnectionStatus } from "./types";

type EventHandler = (event: WSEvent) => void;
type StatusCallback = (status: ConnectionStatus) => void;

class WebSocketClient {
  private ws: WebSocket | null = null;
  private url: string;
  private token: string | null = null;
  private listeners: Map<WSEventType | "all", Set<EventHandler>> = new Map();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private heartbeatInterval: NodeJS.Timeout | null = null;
  private statusCallbacks = new Set<StatusCallback>(); // ✅ FIXED

  constructor(url: string) {
    this.url = url;
  }

  connect(token: string): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      console.log("[WS] Already connected");
      return;
    }

    this.token = token;
    this.updateStatus("connecting");

    try {
      const wsUrl = `${this.url}?token=${token}`;
      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        console.log("[WS] ✅ Connected to WebSocket server");
        this.reconnectAttempts = 0;
        this.updateStatus("connected");
        this.startHeartbeat();
      };

      this.ws.onmessage = (event) => {
        try {
          const message: WSEvent = JSON.parse(event.data);
          console.log("[WS] 📥 Received:", message);
          this.handleMessage(message);
        } catch (error) {
          console.error("[WS] Failed to parse message:", error);
        }
      };

      this.ws.onerror = () => {
        console.error("[WS] ❌ Error event", {
          url: wsUrl,
          readyState: this.ws?.readyState,
        });
        this.updateStatus("error");
      };

      this.ws.onclose = (event) => {
        console.log("[WS] 🔌 Disconnected", {
          code: event.code,
          reason: event.reason,
          wasClean: event.wasClean,
        });
        this.updateStatus("disconnected");
        this.stopHeartbeat();

        // Do not retry auth failures forever.
        if (event.code === 1008) {
          console.warn("[WS] Authentication failed, skipping reconnect");
          return;
        }

        this.attemptReconnect();
      };
    } catch (error) {
      console.error("[WS] Failed to connect:", error);
      this.updateStatus("error");
      this.attemptReconnect();
    }
  }

  disconnect(): void {
    this.reconnectAttempts = this.maxReconnectAttempts;
    this.stopHeartbeat();

    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }

    this.updateStatus("disconnected");
    console.log("[WS] Disconnected");
  }

  send(message: any): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    } else {
      console.warn("[WS] Cannot send message - not connected");
    }
  }

  on(eventType: WSEventType | "all", handler: EventHandler): void {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, new Set());
    }
    this.listeners.get(eventType)!.add(handler);
  }

  off(eventType: WSEventType | "all", handler: EventHandler): void {
    this.listeners.get(eventType)?.delete(handler);
  }

  onStatusChange(callback: StatusCallback): void {
    this.statusCallbacks.add(callback);
  }

  offStatusChange(callback: StatusCallback): void {
    this.statusCallbacks.delete(callback);
  }

  private handleMessage(message: WSEvent): void {
    this.listeners.get("all")?.forEach((handler) => handler(message));
    this.listeners.get(message.type)?.forEach((handler) => handler(message));
  }

  private updateStatus(status: ConnectionStatus): void {
    this.statusCallbacks.forEach((callback) => callback(status));
  }

  private attemptReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.log("[WS] Max reconnect attempts reached");
      return;
    }

    this.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);

    console.log(
      `[WS] Reconnecting in ${delay}ms... (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`,
    );

    setTimeout(() => {
      if (this.token) {
        this.connect(this.token);
      }
    }, delay);
  }

  private startHeartbeat(): void {
    this.heartbeatInterval = setInterval(() => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        this.send({ type: "PING" });
      }
    }, 30000);
  }

  private stopHeartbeat(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  getStatus(): ConnectionStatus {
    if (!this.ws) return "disconnected";

    switch (this.ws.readyState) {
      case WebSocket.CONNECTING:
        return "connecting";
      case WebSocket.OPEN:
        return "connected";
      case WebSocket.CLOSING:
      case WebSocket.CLOSED:
        return "disconnected";
      default:
        return "error";
    }
  }
}

let wsClient: WebSocketClient | null = null;

const resolveWebSocketUrl = () => {
  const explicitWsUrl = process.env.NEXT_PUBLIC_WS_URL;
  if (explicitWsUrl) {
    return explicitWsUrl;
  }

  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  if (apiUrl) {
    try {
      const parsed = new URL(apiUrl);
      parsed.protocol = parsed.protocol === "https:" ? "wss:" : "ws:";
      parsed.pathname = "/ws";
      parsed.search = "";
      parsed.hash = "";
      return parsed.toString();
    } catch {
      // fallback below
    }
  }

  return "ws://localhost:8080/ws";
};

export function getWebSocketClient(): WebSocketClient {
  if (!wsClient) {
    const wsUrl = resolveWebSocketUrl();
    wsClient = new WebSocketClient(wsUrl);
  }
  return wsClient;
}
