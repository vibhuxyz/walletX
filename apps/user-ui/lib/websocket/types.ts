export enum WSEventType {
  CONNECTED = "CONNECTED",
  ERROR = "ERROR",
  TRANSACTION_CREATED = "TRANSACTION_CREATED",
  TRANSACTION_UPDATED = "TRANSACTION_UPDATED",
  BALANCE_UPDATED = "BALANCE_UPDATED",
  REQUEST_CREATED = "REQUEST_CREATED",
  REQUEST_UPDATED = "REQUEST_UPDATED",
}

export interface WSEvent {
  type: WSEventType;
  payload: any;
  timestamp: string;
}

export type ConnectionStatus =
  | "connecting"
  | "connected"
  | "disconnected"
  | "error";
