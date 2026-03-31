export enum WSEventType {
  // Connection events

  CONNECTED = "CONNECTED",
  ERROR = "ERROR",

  // Transaction events
  TRANSACTION_CREATED = "TRANSACTION_CREATED",
  TRANSACTION_UPDATED = "TRANSACTION_UPDATED",

  // Balance events
  BALANCE_UPDATED = "BALANCE_UPDATED",

  // Payment request events
  REQUEST_CREATED = "REQUEST_CREATED",
  REQUEST_UPDATED = "REQUEST_UPDATED",
}

export interface WSEvent {
  type: WSEventType;
  payload: any;
  timestamp: string;
}

// Events from RabbitMQ

export interface TransactionEvent {
  userId: string;
  transactionId: string;
  status: "SUCCESS" | "FAILED" | "PENDING";
  amount: string;
  type: string;
}

export interface BalanceEvent {
  userId: string;
  balance: string;
  availableBalance: string;
}

export interface RequestEvent {
  userId: string;
  requestId: string;
  requesterId: string;
  amount: string;
  status: string;
}
