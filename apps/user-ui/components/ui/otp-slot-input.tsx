"use client";

import {
  useRef,
  KeyboardEvent,
  ClipboardEvent,
  ChangeEvent,
} from "react";
import { cn } from "@/lib/utils";

interface OtpSlotInputProps {
  length?: number;
  value: string;
  onChange: (value: string) => void;
  onComplete?: (value: string) => void;
  disabled?: boolean;
  autoFocus?: boolean;
  /** Mask digits as bullets (use for PIN inputs) */
  masked?: boolean;
  /** Extra classes applied to every slot box */
  slotClassName?: string;
}

/**
 * Custom OTP / PIN slot input built from individual <input> elements.
 * - Numeric-only (blocks letters/symbols)
 * - Auto-advances on digit entry
 * - Backspace clears current slot and returns to previous
 * - Arrow-key navigation
 * - Full paste support
 * - Inputs are centered
 * - Optional masked prop for PIN (shows • bullets)
 */
export function OtpSlotInput({
  length = 6,
  value,
  onChange,
  onComplete,
  disabled,
  autoFocus,
  masked = false,
  slotClassName,
}: OtpSlotInputProps) {
  const refs = useRef<(HTMLInputElement | null)[]>([]);

  // Normalise value into an array of single chars, padding with "" up to `length`
  const digits = Array.from({ length }, (_, i) => value[i] ?? "");

  function focusSlot(index: number) {
    refs.current[Math.max(0, Math.min(index, length - 1))]?.focus();
  }

  function update(newDigits: string[]) {
    const joined = newDigits.join("");
    onChange(joined);
    if (joined.length === length) onComplete?.(joined);
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>, index: number) {
    // ── Digit key: primary capture path ──────────────────────────────────────
    if (/^\d$/.test(e.key)) {
      e.preventDefault(); // stop the browser from inserting the char
      const next = [...digits];
      next[index] = e.key;
      update(next);
      if (index < length - 1) focusSlot(index + 1);
      return;
    }

    if (e.key === "Backspace") {
      e.preventDefault();
      const next = [...digits];
      if (next[index]) {
        // Clear current slot
        next[index] = "";
        update(next);
      } else if (index > 0) {
        // Move back and clear previous slot
        next[index - 1] = "";
        update(next);
        focusSlot(index - 1);
      }
      return;
    }

    if (e.key === "ArrowLeft") {
      e.preventDefault();
      focusSlot(index - 1);
      return;
    }

    if (e.key === "ArrowRight") {
      e.preventDefault();
      focusSlot(index + 1);
      return;
    }

    if (e.key === "Delete") {
      e.preventDefault();
      const next = [...digits];
      next[index] = "";
      update(next);
      return;
    }

    // Block all other printable non-digit characters
    if (!e.ctrlKey && !e.metaKey && e.key.length === 1) {
      e.preventDefault();
    }
  }

  // Narrow fallback: handles mobile autofill / voice input / browser autocomplete
  // onKeyDown already handled normal typing, so this only fires in edge cases.
  function handleChange(e: ChangeEvent<HTMLInputElement>, index: number) {
    const digit = e.target.value.replace(/\D/g, "").slice(-1);
    if (!digit || digits[index] === digit) return; // already handled
    const next = [...digits];
    next[index] = digit;
    update(next);
    if (index < length - 1) focusSlot(index + 1);
  }

  function handlePaste(e: ClipboardEvent<HTMLInputElement>) {
    e.preventDefault();
    const pasted = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, length);
    if (!pasted) return;
    const next = Array.from({ length }, (_, i) => pasted[i] ?? "");
    update(next);
    // Focus the next empty slot or the last slot
    focusSlot(pasted.length < length ? pasted.length : length - 1);
  }

  return (
    <div className="w-full flex items-center justify-center gap-2.5">
      {digits.map((char, i) => (
        <input
          key={i}
          ref={(el) => {
            refs.current[i] = el;
          }}
          type={masked ? "password" : "text"}
          inputMode="numeric"
          pattern="\d*"
          maxLength={1}
          value={char}
          autoFocus={autoFocus && i === 0}
          disabled={disabled}
          autoComplete={masked ? "off" : "one-time-code"}
          onChange={(e) => handleChange(e, i)}
          onKeyDown={(e) => handleKeyDown(e, i)}
          onPaste={handlePaste}
          onFocus={(e) => e.target.select()}
          onClick={(e) => (e.target as HTMLInputElement).select()}
          className={cn(
            // Base slot style
            "h-12 w-12 rounded-xl border-2 border-border bg-card text-center text-lg font-bold text-foreground shadow-sm",
            "transition-all duration-150 outline-none select-none caret-transparent",
            // Active / focus state
            "focus:border-accent focus:ring-4 focus:ring-accent/15 focus:shadow-md focus:shadow-accent/10",
            // Filled state
            char && "border-accent/40 bg-accent/5",
            // Disabled
            "disabled:cursor-not-allowed disabled:opacity-40",
            slotClassName,
          )}
        />
      ))}
    </div>
  );
}
