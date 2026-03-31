"use client";

import { useEffect, useState, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { getWebSocketClient } from "./client";
import { WSEvent, WSEventType, ConnectionStatus } from "./types";
import type { LedgerEntry, LedgerEntriesResponse } from "@/lib/api/ledgerApi";

// ── Shared query keys (must match useWalletQuery.ts exactly) ──────
// Keep this in sync with however useWalletBalance / useRecentTransactions
// define their queryKeys. Change here if your hooks use different keys.
export const WS_QUERY_KEYS = {
  walletBalance: ["wallet", "balance"] as const, // useWalletBalance
  recentTransactions: ["recent-transactions"] as const, // useRecentTransactions
  ledger: ["ledger"] as const, // all ledger queries (prefix)
  walletUser: ["wallet", "user"] as const, // useCurrentUser
};

export function useWebSocket(token: string | null) {
  const queryClient = useQueryClient();
  const [status, setStatus] = useState<ConnectionStatus>("disconnected");
  const ws = getWebSocketClient();

  useEffect(() => {
    if (!token) {
      console.log("[WS Hook] No token, skipping connection");
      return;
    }

    // ── BALANCE_UPDATED ────────────────────────────────────────────
    // Payload shape (what your backend sends):
    //   { availableBalance: "1234.56", currency: "INR", walletId: "..." }
    //
    // We write directly into the cache → ZERO network round-trip, instant UI.
    const balanceHandler = (event: WSEvent) => {
      console.log("[WS] 💰 Balance updated:", event.payload);

      const payload = event.payload as
        | {
            availableBalance?: string;
            currency?: string;
            walletId?: string;
          }
        | undefined;

      if (payload?.availableBalance !== undefined) {
        // ✅ Instant: patch the cached balance data directly
        queryClient.setQueryData(WS_QUERY_KEYS.walletBalance, (old: any) => {
          if (!old) return old;
          return {
            ...old,
            availableBalance: payload.availableBalance,
            ...(payload.currency ? { currency: payload.currency } : {}),
          };
        });
      } else {
        // Payload missing balance — fall back to refetch (still fast)
        queryClient.invalidateQueries({
          queryKey: WS_QUERY_KEYS.walletBalance,
        });
      }
    };

    // ── TRANSACTION_UPDATED ────────────────────────────────────────
    // Payload shape:
    //   { entry: LedgerEntry }  — full ledger entry from backend
    //   OR just signal with no payload → fallback to invalidate
    //
    // Strategy:
    //   1. Prepend the new entry into recent-transactions cache (instant)
    //   2. Patch the matching entry if it already exists (status change)
    //   3. Invalidate ledger queries so full list refetches in background
    const transactionHandler = (event: WSEvent) => {
      console.log("[WS] 📋 Transaction updated:", event.payload);

      const payload = event.payload as { entry?: LedgerEntry } | undefined;
      const newEntry = payload?.entry;

      if (newEntry) {
        // ── Patch recent-transactions cache ────────────────────────
        queryClient.setQueryData(
          WS_QUERY_KEYS.recentTransactions,
          (old: LedgerEntry[] | undefined) => {
            if (!old) return [newEntry];

            // If entry already exists (status update), replace it
            const exists = old.some(
              (t) => t.transactionId === newEntry.transactionId,
            );
            if (exists) {
              return old.map((t) =>
                t.transactionId === newEntry.transactionId ? newEntry : t,
              );
            }

            // New entry — prepend and keep max 10
            return [newEntry, ...old].slice(0, 10);
          },
        );

        // ── Patch any cached ledger query that contains this entry ──
        // This covers ["ledger", "topup", 10] on the topup page etc.
        queryClient.setQueriesData<LedgerEntriesResponse>(
          { queryKey: WS_QUERY_KEYS.ledger },
          (old) => {
            if (!old?.entries) return old;

            const exists = old.entries.some(
              (t) => t.transactionId === newEntry.transactionId,
            );

            if (exists) {
              // Status changed — update in place
              return {
                ...old,
                entries: old.entries.map((t) =>
                  t.transactionId === newEntry.transactionId ? newEntry : t,
                ),
              };
            }

            // New entry — prepend
            return {
              ...old,
              entries: [newEntry, ...old.entries],
              pagination: {
                ...old.pagination,
                total: old.pagination.total + 1,
              },
            };
          },
        );
      }

      // Always invalidate in background so next focus/refetch is fresh
      // This does NOT cause an immediate network request if data is fresh
      queryClient.invalidateQueries({
        queryKey: WS_QUERY_KEYS.ledger,
        refetchType: "none", // ← mark stale but don't refetch right now
      });
      queryClient.invalidateQueries({
        queryKey: WS_QUERY_KEYS.recentTransactions,
        refetchType: "none",
      });
    };

    // Register listeners
    ws.onStatusChange(setStatus);
    ws.on(WSEventType.TRANSACTION_UPDATED, transactionHandler);
    ws.on(WSEventType.BALANCE_UPDATED, balanceHandler);

    // Connect (safely ignored if already connected)
    ws.connect(token);

    return () => {
      ws.off(WSEventType.TRANSACTION_UPDATED, transactionHandler);
      ws.off(WSEventType.BALANCE_UPDATED, balanceHandler);
      ws.offStatusChange(setStatus);
    };
  }, [token, queryClient, ws]);

  const disconnect = useCallback(() => {
    ws.disconnect();
  }, [ws]);

  return {
    status,
    disconnect,
    isConnected: status === "connected",
    isConnecting: status === "connecting",
  };
}
