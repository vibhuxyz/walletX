import { api } from "./client";

export interface WSTokenResponse {
  token: string;
  expiresIn: number;
}

export async function getWebSocketToken(): Promise<WSTokenResponse> {
  const { data } = await api.get("/api/v0/wallet/ws-token");
  return data.data as WSTokenResponse;
}
