/**
 * useOtpCountdown — shared countdown hook.
 *
 * Previously duplicated (with minor differences) between:
 *   - app/dashboard/top-up.tsx
 *   - app/bank-otp/page.tsx
 *   - app/auth/verify-otp/page.tsx
 */

import { useState, useEffect, useCallback, useRef } from "react";

interface UseOtpCountdownOptions {
  /** Initial seconds. Default: 60 */
  initialSeconds?: number;
  /** Auto-start on mount. Default: true */
  autoStart?: boolean;
}

interface UseOtpCountdownReturn {
  countdown: number;
  canResend: boolean;
  start: () => void;
  reset: () => void;
  minutes: number;
  seconds: number;
}

export function useOtpCountdown({
  initialSeconds = 60,
  autoStart = true,
}: UseOtpCountdownOptions = {}): UseOtpCountdownReturn {
  const [countdown, setCountdown] = useState(autoStart ? initialSeconds : 0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const clear = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const start = useCallback(() => {
    clear();
    setCountdown(initialSeconds);
    timerRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clear();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, [initialSeconds]);

  const reset = useCallback(() => {
    clear();
    setCountdown(0);
  }, []);

  useEffect(() => {
    if (autoStart) start();
    return clear;
  }, [autoStart, start]);

  return {
    countdown,
    canResend: countdown <= 0,
    start,
    reset,
    minutes: Math.floor(countdown / 60),
    seconds: countdown % 60,
  };
}
