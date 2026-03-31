import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";

interface SyncState {
  isFocus: boolean;
  isOnline: boolean;
  connectionType: "4g" | "3g" | "2g" | "slow-2g" | "unknown";
  saveData: boolean;
}

const getRefetchInterval = (state: SyncState) => {
  if (!state.isOnline || !state.isFocus) return false;
  
  if (state.saveData || state.connectionType === "2g" || state.connectionType === "slow-2g") {
    return 1000 * 60; // 60 seconds for slow/saveData connections
  }
  
  return 1000 * 10; // 10 seconds active high-speed polling
};

export function useAdaptiveSync() {
  const queryClient = useQueryClient();
  const [syncState, setSyncState] = useState<SyncState>({
    isFocus: typeof document !== "undefined" ? document.visibilityState === "visible" : true,
    isOnline: typeof navigator !== "undefined" ? navigator.onLine : true,
    connectionType: "unknown",
    saveData: false,
  });

  useEffect(() => {
    // 1. Setup online/offline listeners
    const handleOnline = () => setSyncState((s) => ({ ...s, isOnline: true }));
    const handleOffline = () => setSyncState((s) => ({ ...s, isOnline: false }));
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // 2. Setup document visibility listeners
    const handleVisibilityChange = () => {
      setSyncState((s) => ({ ...s, isFocus: document.visibilityState === "visible" }));
      if (document.visibilityState === "hidden") {
        // Clear caches to handle memory pressure when app goes entirely to background
        queryClient.removeQueries({ type: "inactive" });
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);

    // 3. Setup Network Information API (navigator.connection)
    const conn = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
    const updateConnectionStatus = () => {
      if (conn) {
        setSyncState((s) => ({
          ...s,
          connectionType: conn.effectiveType || "unknown",
          saveData: conn.saveData || false,
        }));
      }
    };
    if (conn) {
      updateConnectionStatus();
      conn.addEventListener("change", updateConnectionStatus);
    }

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      if (conn) conn.removeEventListener("change", updateConnectionStatus);
    };
  }, [queryClient]);

  return {
    syncState,
    refetchInterval: getRefetchInterval(syncState),
  };
}
