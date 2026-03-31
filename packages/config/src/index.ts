import path from "path";
import { fileURLToPath } from "url";
import { config } from "dotenv";

const _filename = fileURLToPath(import.meta.url);
const _dirname = path.dirname(_filename);

// Load root .env
config({ path: path.resolve(_dirname, "../../../.env") });

function requireEnv(key: string, fallback?: string): string {
  const value = process.env[key] ?? fallback;

  if (!value) {
    console.error(`❌ ENV MISSING: ${key}`);
    process.exit(1);
  }

  console.log(`✅ ENV LOADED: ${key}`);
  return value;
}

function requireNumber(key: string, fallback?: number): number {
  const value = process.env[key] ?? fallback?.toString();

  if (!value || isNaN(Number(value))) {
    console.error(`❌ INVALID OR MISSING NUMBER ENV: ${key}`);
    process.exit(1);
  }

  console.log(`✅ ENV LOADED: ${key}`);
  return Number(value);
}

export const ENV = {
  NODE_ENV: requireEnv("NODE_ENV"),
  // Database
  POSTGRES_URL: requireEnv("POSTGRES_URL"),
  MONGO_URL: requireEnv("MONGO_URL"),
  REDIS_DATABASE_URL: requireEnv("REDIS_DATABASE_URL"),
  RABBITMQ_URL: requireEnv("RABBITMQ_URL"),

  // JWT
  JWT_SECRET: requireEnv("JWT_SECRET"),
  JWT_EXPIRY: requireEnv("JWT_EXPIRY"),
  REFRESH_TOKEN_EXPIRY: requireEnv("REFRESH_TOKEN_EXPIRY"),
  CSRF_SECRET: requireEnv("CSRF_SECRET"),
  COOKIE_SECRET: requireEnv("COOKIE_SECRET"),

  //  Hashing
  BCRYPT_ROUNDS: requireEnv("BCRYPT_ROUNDS"),

  // Ports
  API_GATEWAY_PORT: requireNumber("API_GATEWAY_PORT"),
  AUTH_SERVICE_PORT: requireNumber("AUTH_SERVICE_PORT"),
  WALLET_SERVICE_PORT: requireNumber("WALLET_SERVICE_PORT"),
  BANK_SERVICE_PORT: requireNumber("BANK_SERVICE_PORT"),
  WORKER_SERVICE_PORT: requireNumber("WORKER_SERVICE_PORT"),
  REALTIME_SERVICE_PORT: requireNumber("REALTIME_SERVICE_PORT"),

  // Service URLs
  AUTH_SERVICE_URL: requireEnv("AUTH_SERVICE_URL"),
  WALLET_SERVICE_URL: requireEnv("WALLET_SERVICE_URL"),
  BANK_SERVICE_URL: requireEnv("BANK_SERVICE_URL"),
  MERCHANT_SERVICE_URL: requireEnv("MERCHANT_SERVICE_URL"),
  REALTIME_SERVICE_URL: requireEnv("REALTIME_SERVICE_URL"),

  WALLET_SERVICE_API_KEY: requireEnv("WALLET_SERVICE_API_KEY"),

  //  emial
  SMTP_HOST: requireEnv("SMTP_HOST"),
  SMTP_PORT: requireEnv("SMTP_PORT"),
  SMTP_USER: requireEnv("SMTP_USER"),
  SMTP_PASS: requireEnv("SMTP_PASS"),
  EMAIL_FROM: requireEnv("EMAIL_FROM"),

  // RESEND_API_KEY: requireEnv("RESEND_API_KEY"),

  BREVO_API_KEY: requireEnv("BREVO_API_KEY"),

  // SMS (Twilio)
  // TWILIO_ACCOUNT_SID: requireEnv("TWILIO_ACCOUNT_SID"),
  // TWILIO_AUTH_TOKEN: requireEnv("TWILIO_AUTH_TOKEN"),
  // TWILIO_PHONE_NUMBER: requireEnv("TWILIO_PHONE_NUMBER"),

  // Rate Limits
  // OTP_RATE_LIMIT: requireNumber("OTP_RATE_LIMIT"),
  // PIN_ATTEMPT_LIMIT: requireNumber("PIN_ATTEMPT_LIMIT"),

  // Business Rules
  MIN_TOPUP_AMOUNT: requireNumber("MIN_TOPUP_AMOUNT"),
  MAX_TOPUP_AMOUNT: requireNumber("MAX_TOPUP_AMOUNT"),
  MIN_P2P_AMOUNT: requireNumber("MIN_P2P_AMOUNT"),
  MAX_P2P_AMOUNT: requireNumber("MAX_P2P_AMOUNT"),

  CLOUDINARY_CLOUD_NAME: requireEnv("CLOUDINARY_CLOUD_NAME"),
  CLOUDINARY_API_KEY: requireEnv("CLOUDINARY_API_KEY"),
  CLOUDINARY_API_SECRET: requireEnv("CLOUDINARY_API_SECRET"),
  CLOUDINARY_FOLDER: requireEnv("CLOUDINARY_FOLDER"),

  // TRANSACTION_FEE_PERCENT: requireNumber("TRANSACTION_FEE_PERCENT"),
  // UI
  FRONTEND_URL: requireEnv("FRONTEND_URL"),
};
