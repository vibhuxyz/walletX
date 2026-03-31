"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useRef,
} from "react";
import { getWebSocketClient } from "@/lib/websocket/client";
import { useAuth } from "@/lib/auth-context";
import { useQueryClient } from "@tanstack/react-query";
import { qk } from "@/lib/wallet/useWalletQuery";
import type { BroadcastLeader as BroadcastLeaderType } from "@/lib/realtime/BroadcastLeader";

interface WsContextValue {
  isLeader: boolean;
  status: string;
}

const WsContext = createContext<WsContextValue>({
  isLeader: false,
  status: "disconnected",
});

export function WsProvider({ children }: { children: React.ReactNode }) {
  const [isLeader, setIsLeader] = useState(false);
  const [status, setStatus] = useState("disconnected");
  const leaderRef = useRef<BroadcastLeaderType | null>(null);
  const { auth } = useAuth();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!auth.isAuthenticated) {
      if (leaderRef.current) leaderRef.current.destroy();
      getWebSocketClient().disconnect();
      return;
    }

    const setupLeader = (
      token: string,
      BroadcastLeaderClass: typeof BroadcastLeaderType,
    ) => {
      if (leaderRef.current) leaderRef.current.destroy();

      leaderRef.current = new BroadcastLeaderClass(
        "wallet_realtime_sync",
        (isNowLeader: boolean) => {
          setIsLeader(isNowLeader);
          const wsClient = getWebSocketClient();
          if (isNowLeader) {
            // I am leader - open actual WebSocket
            wsClient.connect(token);

            wsClient.on("all", (eventData: any) => {
              // Forward WS messages to followers
              leaderRef.current?.broadcast("WS_PAYLOAD", eventData);
              handleGlobalEvents(eventData);
            });

            wsClient.onStatusChange(setStatus);
          } else {
            // I am a follower - disconnect WebSocket
            wsClient.disconnect();
            setStatus("connected (follower)");
          }
        },
        (msg: { type: string; payload: any }) => {
          if (msg.type === "WS_PAYLOAD") {
            handleGlobalEvents(msg.payload);
          }
        },
      );
    };

    import("@/lib/api/websocket").then(({ getWebSocketToken }) =>
      getWebSocketToken()
        .then(({ token }) => {
          // Dynamically import BroadcastLeader so the Edge SSR bundler
          // never statically resolves BroadcastChannel (browser-only API).
          import("@/lib/realtime/BroadcastLeader").then(
            ({ BroadcastLeader }) => {
              setupLeader(token, BroadcastLeader);
            },
          );
        })
        .catch((err) => {
          console.error("Failed to fetch WS token for Leader", err);
        }),
    );

    return () => {
      if (leaderRef.current) {
        leaderRef.current.destroy();
      }
      getWebSocketClient().disconnect();
    };
  }, [auth.isAuthenticated, queryClient]);

  // Handle data invalidation regardless if leader or follower
  const handleGlobalEvents = (event: any) => {
    switch (event.type) {
      case "BALANCE_UPDATED":
        queryClient.invalidateQueries({ queryKey: qk.balance });
        queryClient.invalidateQueries({ queryKey: qk.dashboardSummary });
        break;
      case "TRANSACTION_UPDATED":
      case "TRANSACTION_CREATED":
        queryClient.invalidateQueries({ queryKey: qk.recentTransactionsRoot });
        queryClient.invalidateQueries({ queryKey: qk.ledgerRoot });
        queryClient.invalidateQueries({ queryKey: qk.ledgerStats });
        queryClient.invalidateQueries({ queryKey: qk.ledgerAnalyticsRoot });
        queryClient.invalidateQueries({ queryKey: qk.dashboardSummary });
        break;
    }
  };

  return (
    <WsContext.Provider value={{ isLeader, status }}>
      {children}
    </WsContext.Provider>
  );
}

export const useWsStatus = () => useContext(WsContext);
