import argon2 from "argon2";
import crypto from "crypto";

const ARGON2_OPTIONS = {
  type: argon2.argon2d,
  memoryCost: 65536,
  timeCost: 3,
  parallelism: 4,
};

export async function hashPassword(password: string): Promise<string> {
  return argon2.hash(password, ARGON2_OPTIONS);
}

export const verifyPassword = async (password: string, hash: string) => {
  try {
    return await argon2.verify(hash, password);
  } catch {
    return false;
  }
};

export const hashPin = async (pin: string) => {
  return argon2.hash(pin, {
    ...ARGON2_OPTIONS,
    memoryCost: 32768,
  });
};

export const verifyPin = async (pin: string, hash: string) => {
  try {
    return await argon2.verify(hash, pin);
  } catch {
    return false;
  }
};

export const hashOTP = async (otp: string): Promise<string> => {
  return crypto.createHash("sha256").update(otp).digest("hex");
};

export async function verifyOTP(otp: string, hash: string): Promise<boolean> {
  try {
    if (hash.startsWith("$argon2")) {
      return await argon2.verify(hash, otp);
    }
    const currentHash = crypto.createHash("sha256").update(otp).digest("hex");
    const currentBuffer = Buffer.from(currentHash, "hex");
    const hashBuffer = Buffer.from(hash, "hex");
    
    if (currentBuffer.length !== hashBuffer.length) return false;
    return crypto.timingSafeEqual(currentBuffer, hashBuffer);
  } catch {
    return false;
  }
}
