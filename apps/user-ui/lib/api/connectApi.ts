import { api } from "@/lib/api/client";

export const CONNECT_SCOPES = [
  "wallet:read",
  "wallet:hold",
  "wallet:capture",
  "wallet:credit",
] as const;

export type ConnectScope = (typeof CONNECT_SCOPES)[number];

export interface PartnerApp {
  id: string;
  name: string;
  apiKey: string;
  redirectUris: string[];
  scopes: ConnectScope[];
  status: "ACTIVE" | "SUSPENDED";
  createdAt: string;
  updatedAt: string;
  counts: {
    walletLinks: number;
    onboardingSessions: number;
    holds: number;
  };
}

export interface CreatedPartnerApp extends Omit<PartnerApp, "updatedAt" | "counts"> {
  apiSecret: string;
}

export interface CreatePartnerInput {
  name: string;
  redirectUris: string[];
  scopes: ConnectScope[];
}

function serviceKeyHeaders(serviceKey: string) {
  return {
    "X-WalletX-Service-Key": serviceKey,
  };
}

export async function listConnectPartners(serviceKey: string) {
  const { data } = await api.get("/api/v1/connect/partners", {
    headers: serviceKeyHeaders(serviceKey),
  });
  return data.data as PartnerApp[];
}

export async function createConnectPartner(
  input: CreatePartnerInput,
  serviceKey: string,
) {
  const { data } = await api.post("/api/v1/connect/partners", input, {
    headers: serviceKeyHeaders(serviceKey),
  });
  return data.data as CreatedPartnerApp;
}

export interface ConnectSession {
  id: string;
  partner: {
    id: string;
    name: string;
  };
  partnerUserId: string;
  email: string;
  phone?: string | null;
  fullName?: string | null;
  status: "PENDING" | "COMPLETED" | "EXPIRED" | "CANCELLED";
  expiresAt: string;
}

export interface CompleteConnectSessionResponse {
  redirectUrl: string;
  walletUserId: string;
  walletId: string;
  status: string;
}

export async function getConnectSession(sessionId: string) {
  const { data } = await api.get(`/api/v1/connect/onboarding-sessions/${sessionId}`);
  return data.data as ConnectSession;
}

export async function completeConnectSession(sessionId: string) {
  const { data } = await api.post(
    `/api/v1/connect/onboarding-sessions/${sessionId}/complete`,
  );
  return data.data as CompleteConnectSessionResponse;
}
