"use client";

/**
 * Shared OTP / PIN input components.
 *
 * Eliminates duplicated InputOTP blocks found across:
 *   - create-pin-form.tsx
 *   - verify-otp-page.tsx
 *   - login-page.tsx (OTP screen)
 *   - add-bank-account.tsx  (PIN + OTP steps)
 *   - send-money.tsx        (PIN step)
 *   - top-up.tsx            (PIN + OTP steps)
 */

import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";

// ─── 4-slot PIN Input ─────────────────────────────────────────────────────────

interface PinInputProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export function PinInput({ value, onChange, disabled }: PinInputProps) {
  return (
    <InputOTP
      maxLength={4}
      value={value}
      onChange={onChange}
      disabled={disabled}
    >
      <InputOTPGroup>
        {Array.from({ length: 4 }).map((_, i) => (
          <InputOTPSlot key={i} index={i} />
        ))}
      </InputOTPGroup>
    </InputOTP>
  );
}

// ─── 6-slot Email / Bank OTP Input ───────────────────────────────────────────

interface OtpInputProps {
  value: string;
  onChange: (value: string) => void;
  onComplete?: () => void;
  disabled?: boolean;
}

export function OtpInput({
  value,
  onChange,
  onComplete,
  disabled,
}: OtpInputProps) {
  return (
    <InputOTP
      maxLength={6}
      value={value}
      onChange={onChange}
      onComplete={onComplete}
      disabled={disabled}
    >
      <InputOTPGroup>
        {Array.from({ length: 6 }).map((_, i) => (
          <InputOTPSlot key={i} index={i} />
        ))}
      </InputOTPGroup>
    </InputOTP>
  );
}
