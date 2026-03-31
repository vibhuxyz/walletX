"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Wifi, WifiOff, Loader2, CheckCircle } from "lucide-react";
import { ConnectionStatus } from "@/lib/websocket/types";
import { useEffect, useState } from "react";

interface ConnectionStatusIndicatorProps {
  status: ConnectionStatus;
}

export function ConnectionStatusIndicator({
  status,
}: ConnectionStatusIndicatorProps) {
  const [show, setShow] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    if (status === "connected") {
      // Show brief success message
      setShowSuccess(true);
      setShow(true);
      const timer = setTimeout(() => {
        setShow(false);
        setShowSuccess(false);
      }, 2000);
      return () => clearTimeout(timer);
    } else if (status !== "disconnected") {
      // Show for connecting/error states
      setShow(true);
      setShowSuccess(false);
    } else {
      setShow(false);
    }
  }, [status]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="fixed top-4 right-4 z-50"
        >
          <div
            className={`flex items-center gap-2 rounded-lg px-4 py-2 shadow-lg border
              ${status === "connecting" ? "bg-yellow-50 border-yellow-200 text-yellow-700" : ""}
              ${status === "connected" && showSuccess ? "bg-green-50 border-green-200 text-green-700" : ""}
              ${status === "error" ? "bg-red-50 border-red-200 text-red-700" : ""}
            `}
          >
            {status === "connecting" && (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm font-medium">Connecting...</span>
              </>
            )}
            {status === "connected" && showSuccess && (
              <>
                <CheckCircle className="h-4 w-4" />
                <span className="text-sm font-medium">Connected</span>
              </>
            )}
            {status === "error" && (
              <>
                <WifiOff className="h-4 w-4" />
                <span className="text-sm font-medium">Connection Error</span>
              </>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
