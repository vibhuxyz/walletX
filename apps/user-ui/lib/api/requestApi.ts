import { api } from "@/lib/api/client";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface CreateRequestPayload {
  recipientIdentifier: string; // email, phone, or wallet QR
  amount: string;
  reason?: string;
}

export interface CreateRequestResponse {
  requestId: string;
  amount: string;
  reason?: string;
  recipient: {
    name: string;
    email: string;
  };
  status: string;
  expiresAt: string;
  createdAt: string;
}

export interface PaymentRequest {
  requestId: string;
  requester?: {
    name: string;
    email: string;
  };
  requestedFrom?: {
    name: string;
    email: string;
  };
  amount: string;
  reason?: string;
  status: "PENDING" | "APPROVED" | "REJECTED" | "EXPIRED";
  expiresAt: string;
  respondedAt?: string;
  createdAt: string;
}

export interface RequestsListResponse {
  requests: PaymentRequest[];
  nextCursor?: string;
  hasMore: boolean;
}

export interface RequestDetailsResponse {
  requestId: string;
  requester: {
    name: string;
    email: string;
  };
  requestedFrom: {
    name: string;
    email: string;
  };
  amount: string;
  reason?: string;
  status: string;
  transferId?: string;
  expiresAt: string;
  respondedAt?: string;
  createdAt: string;
  isRequester: boolean;
  isRecipient: boolean;
}

export interface PayRequestResponse {
  requestId: string;
  transferId: string;
  status: string;
  amount: string;
  requester: {
    name: string;
    email: string;
  };
  newBalance: string;
  timestamp: string;
}

// ─── API Functions ────────────────────────────────────────────────────────────

export async function createPaymentRequest(
  payload: CreateRequestPayload,
): Promise<CreateRequestResponse> {
  const { data } = await api.post("/api/v0/wallet/requests", payload);
  return data.data as CreateRequestResponse;
}

export async function getSentRequests(
  status?: string,
  limit = 20,
): Promise<RequestsListResponse> {
  const { data } = await api.get("/api/v0/wallet/requests/sent", {
    params: { status, limit },
  });
  return data.data as RequestsListResponse;
}

export async function getReceivedRequests(
  status?: string,
  limit = 20,
): Promise<RequestsListResponse> {
  const { data } = await api.get("/api/v0/wallet/requests/received", {
    params: { status, limit },
  });
  return data.data as RequestsListResponse;
}

export async function getRequestDetails(
  requestId: string,
): Promise<RequestDetailsResponse> {
  const { data } = await api.get(`/api/v0/wallet/requests/${requestId}`);
  return data.data as RequestDetailsResponse;
}

export async function payRequest(
  requestId: string,
  pin: string,
): Promise<PayRequestResponse> {
  const { data } = await api.post(`/api/v0/wallet/requests/${requestId}/pay`, {
    pin,
  });
  return data.data as PayRequestResponse;
}

export async function declineRequest(requestId: string): Promise<void> {
  await api.post(`/api/v0/wallet/requests/${requestId}/decline`);
}

export async function cancelRequest(requestId: string): Promise<void> {
  await api.delete(`/api/v0/wallet/requests/${requestId}/cancel`);
}
