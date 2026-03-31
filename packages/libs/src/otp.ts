import crypto from "crypto";
import { nanoid } from "nanoid";

export function generateQRCode(prefix: string = "WALLET"): string {
  return `${prefix}_${nanoid(16).toUpperCase()}`;
}

export function normalizeWalletHandle(seed: string): string {
  const localPart = seed.split("@")[0] || seed;
  const normalized = localPart
    .toLowerCase()
    .replace(/[^a-z0-9._-]/g, "")
    .replace(/[._-]{2,}/g, ".")
    .replace(/^[._-]+|[._-]+$/g, "")
    .slice(0, 24);

  if (normalized.length >= 3) {
    return normalized;
  }

  return `user${nanoid(4).toLowerCase()}`;
}

export function generateWalletHandle(seed: string): string {
  return `${normalizeWalletHandle(seed)}@wallet`;
}

export function generateOTP(length: number = 6): string {
  const digits = "0123456789";
  let otp = "";

  for (let i = 0; i < length; i++) {
    const randomIndex = crypto.randomInt(0, digits.length);
    otp += digits[randomIndex];
  }

  return otp;
}

export function validatePIN(pin: string): { valid: boolean; error?: string } {
  if (pin.length !== 4) {
    return { valid: false, error: "PIN must be 4 digits" };
  }

  if (!/^\d{4}$/.test(pin)) {
    return { valid: false, error: "PIN must contain only digits" };
  }

  // Check for sequential numbers
  if (pin === "1234" || pin === "4321" || pin === "0123") {
    return { valid: false, error: "PIN cannot be sequential" };
  }

  // Check for repeated digits
  if (/^(.)\1{3}$/.test(pin)) {
    return { valid: false, error: "PIN cannot be all same digits" };
  }

  return { valid: true };
}
