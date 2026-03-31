"use client";

import {
  createContext,
  useContext,
  useCallback,
  useMemo,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter, usePathname } from "next/navigation";
import { toast } from "sonner";
import { authApi } from "@/lib/api/auth";
import {
  useCurrentUser,
  fetchCurrentUser,
  fetchDashboardSummary,
  fetchRecentTransactions,
  qk,
} from "@/lib/wallet/useWalletQuery";
import { fetchLinkedAccounts } from "@/lib/api/bankApi";
import { getReceivedRequests } from "@/lib/api/requestApi";
import { getWebSocketToken } from "@/lib/api/websocket";
import { getWebSocketClient } from "@/lib/websocket/client";
import { ConnectionStatus, WSEventType } from "@/lib/websocket/types";
import type { WSEvent } from "@/lib/websocket/types";
import type { LedgerEntriesResponse, LedgerEntry } from "@/lib/api/ledgerApi";
import DashboardSkeleton from "@/components/skeleton/DashboardSkeleton";

type UserRole = "user" | "merchant" | "admin" | null;

interface AuthState {
  isAuthenticated: boolean;
  role: UserRole;
  kycComplete: boolean;
  email: string;
  name: string;
  isLoading: boolean;
}

interface AuthContextType {
  auth: AuthState;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  isLoggingOut: boolean;
  wsStatus: ConnectionStatus;
}

const AuthContext = createContext<AuthContextType | null>(null);

// These /auth routes are part of the onboarding flow and must stay accessible
// even after the auth cookie is already set.
const AUTH_ONBOARDING_PATHS = ["/auth/create-pin", "/auth/kyc"];

const RECENT_TRANSACTIONS_LIMIT = 10;

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const queryClient = useQueryClient();
  const [isClient, setIsClient] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [wsStatus, setWsStatus] = useState<ConnectionStatus>("disconnected");

  useEffect(() => {
    setIsClient(true);
  }, []);

  const pathnameSafe = typeof pathname === "string" ? pathname : "";
  const isDashboardRoute = pathnameSafe.startsWith("/dashboard");
  const isPrivateRoute = pathnameSafe.startsWith("/private");
  const isProtectedRoute = isDashboardRoute || isPrivateRoute;
  const isAuthRoute = pathnameSafe.startsWith("/auth");
  const isOnboardingPage = AUTH_ONBOARDING_PATHS.some((p) =>
    pathnameSafe.startsWith(p),
  );

  const { data: user, isLoading, isFetching } = useCurrentUser(true);

  const auth = useMemo<AuthState>(() => {
    if (isLoading || isFetching) {
      return {
        isAuthenticated: false,
        role: null,
        kycComplete: false,
        email: "",
        name: "",
        isLoading: true,
      };
    }

    if (!user) {
      return {
        isAuthenticated: false,
        role: null,
        kycComplete: false,
        email: "",
        name: "",
        isLoading: false,
      };
    }

    return {
      isAuthenticated: true,
      role: (user.role?.toLowerCase() as UserRole) || "user",
      kycComplete: user.wallet?.status === "ACTIVE",
      email: user.email,
      name: user.fullName || user.email.split("@")[0],
      isLoading: false,
    };
  }, [user, isLoading, isFetching]);

  useEffect(() => {
    if (!auth.isAuthenticated) return;

    const ws = getWebSocketClient();
    ws.onStatusChange(setWsStatus);

    const balanceHandler = (event: WSEvent) => {
      const payload = event.payload as
        | { availableBalance?: string; balance?: string }
        | undefined;

      const newBalance = payload?.availableBalance ?? payload?.balance;

      if (newBalance !== undefined) {
        queryClient.setQueryData(qk.balance, (old: any) =>
          old ? { ...old, availableBalance: newBalance } : old,
        );

        queryClient.setQueryData(qk.dashboardSummary, (old: any) =>
          old ? { ...old, availableBalance: newBalance } : old,
        );
      } else {
        queryClient.invalidateQueries({ queryKey: qk.balance });
        queryClient.invalidateQueries({ queryKey: qk.dashboardSummary });
      }
    };

    const transactionHandler = (event: WSEvent) => {
      const payload = event.payload as
        | {
            transactionId?: string;
            status?: string;
            amount?: string;
            type?: string;
            entry?: LedgerEntry;
          }
        | undefined;

      if (payload?.entry) {
        const newEntry = payload.entry;

        queryClient.setQueriesData<LedgerEntry[]>(
          { queryKey: qk.recentTransactionsRoot },
          (old) => {
            if (!old) return [newEntry];

            const exists = old.some(
              (t) => t.transactionId === newEntry.transactionId,
            );

            if (exists) {
              return old.map((t) =>
                t.transactionId === newEntry.transactionId ? newEntry : t,
              );
            }

            return [newEntry, ...old].slice(0, old.length || 10);
          },
        );

        queryClient.setQueriesData<LedgerEntriesResponse>(
          { queryKey: qk.ledgerRoot },
          (old) => {
            if (!old?.entries) return old;

            const exists = old.entries.some(
              (t) => t.transactionId === newEntry.transactionId,
            );

            if (exists) {
              return {
                ...old,
                entries: old.entries.map((t) =>
                  t.transactionId === newEntry.transactionId ? newEntry : t,
                ),
              };
            }

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
      } else if (payload?.transactionId && payload?.status) {
        const { transactionId, status } = payload;

        queryClient.setQueriesData<LedgerEntry[]>(
          { queryKey: qk.recentTransactionsRoot },
          (old) => {
            if (!old) return old;

            return old.map((t) =>
              t.transactionId === transactionId
                ? { ...t, status: status as LedgerEntry["status"] }
                : t,
            );
          },
        );

        queryClient.setQueriesData<LedgerEntriesResponse>(
          { queryKey: qk.ledgerRoot },
          (old) => {
            if (!old?.entries) return old;

            return {
              ...old,
              entries: old.entries.map((t) =>
                t.transactionId === transactionId
                  ? { ...t, status: status as LedgerEntry["status"] }
                  : t,
              ),
            };
          },
        );
      }

      queryClient.invalidateQueries({
        queryKey: qk.ledgerRoot,
        refetchType: "none",
      });
      queryClient.invalidateQueries({
        queryKey: qk.recentTransactionsRoot,
        refetchType: "none",
      });
      queryClient.invalidateQueries({
        queryKey: qk.walletTransactionsRoot,
        refetchType: "none",
      });
      queryClient.invalidateQueries({
        queryKey: qk.ledgerStats,
        refetchType: "none",
      });
      queryClient.invalidateQueries({
        queryKey: qk.ledgerAnalyticsRoot,
        refetchType: "none",
      });
      queryClient.invalidateQueries({
        queryKey: qk.dashboardSummary,
        refetchType: "none",
      });
    };

    ws.on(WSEventType.BALANCE_UPDATED, balanceHandler);
    ws.on(WSEventType.TRANSACTION_UPDATED, transactionHandler);

    const currentStatus = ws.getStatus();
    if (currentStatus === "connected") {
      setWsStatus("connected");
    } else {
      getWebSocketToken()
        .then(({ token }) => ws.connect(token))
        .catch((err) => {
          console.error("[Auth] Failed to get WS token:", err);
          setWsStatus("error");
        });
    }

    return () => {
      ws.offStatusChange(setWsStatus);
      ws.off(WSEventType.BALANCE_UPDATED, balanceHandler);
      ws.off(WSEventType.TRANSACTION_UPDATED, transactionHandler);
    };
  }, [auth.isAuthenticated, queryClient]);

  useEffect(() => {
    if (!auth.isAuthenticated && !auth.isLoading) {
      getWebSocketClient().disconnect();
      setWsStatus("disconnected");
    }
  }, [auth.isAuthenticated, auth.isLoading]);

  useEffect(() => {
    if (!isClient) return;
    if (auth.isLoading) return;
    if (isLoggingOut) return;

    if (!auth.isAuthenticated && isProtectedRoute) {
      router.replace("/auth/login");
      return;
    }

    if (auth.isAuthenticated && isAuthRoute && !isOnboardingPage) {
      router.replace("/dashboard");
    }
  }, [
    auth.isAuthenticated,
    auth.isLoading,
    isProtectedRoute,
    isAuthRoute,
    isOnboardingPage,
    isClient,
    isLoggingOut,
    router,
  ]);

  const prefetchDashboardData = useCallback(() => {
    void Promise.allSettled([
      queryClient.prefetchQuery({
        queryKey: qk.dashboardSummary,
        queryFn: fetchDashboardSummary,
        staleTime: 1000 * 30,
      }),
      queryClient.prefetchQuery({
        queryKey: qk.recentTransactions(RECENT_TRANSACTIONS_LIMIT),
        queryFn: () => fetchRecentTransactions(RECENT_TRANSACTIONS_LIMIT),
        staleTime: 1000 * 30,
      }),
      queryClient.prefetchQuery({
        queryKey: qk.bankAccounts,
        queryFn: fetchLinkedAccounts,
        staleTime: 1000 * 60 * 5,
      }),
      queryClient.prefetchQuery({
        queryKey: qk.paymentRequestsReceived,
        queryFn: () => getReceivedRequests(),
        staleTime: 1000 * 30,
      }),
    ]);
  }, [queryClient]);

  const login = useCallback(async () => {
    await queryClient.fetchQuery({
      queryKey: qk.user,
      queryFn: fetchCurrentUser,
      staleTime: 0,
    });

    prefetchDashboardData();
    router.push("/dashboard");
  }, [prefetchDashboardData, queryClient, router]);

  const logout = useCallback(async () => {
    if (isLoggingOut) return;

    setIsLoggingOut(true);

    try {
      await authApi.logout(auth.role || "user");
    } catch (error) {
      console.error("Logout API error:", error);
    }

    queryClient.clear();
    sessionStorage.clear();
    toast.success("Logged out");
    router.replace("/");
    setIsLoggingOut(false);
  }, [auth.role, queryClient, router, isLoggingOut]);

  const shouldShowSkeleton = isProtectedRoute && (!isClient || auth.isLoading);

  return (
    <AuthContext.Provider
      value={{ auth, login, logout, isLoggingOut, wsStatus }}
    >
      {shouldShowSkeleton ? <DashboardSkeleton /> : children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
