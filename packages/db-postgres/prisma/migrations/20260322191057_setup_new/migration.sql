-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('USER', 'MERCHANT', 'BANK_ADMIN', 'SUPER_ADMIN');

-- CreateEnum
CREATE TYPE "WalletStatus" AS ENUM ('PENDING_PIN', 'PENDING_KYC', 'ACTIVE', 'SUSPENDED', 'CLOSED');

-- CreateEnum
CREATE TYPE "IdType" AS ENUM ('PAN', 'AADHAAR', 'PASSPORT');

-- CreateEnum
CREATE TYPE "KycStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "LedgerStatus" AS ENUM ('PENDING', 'SUCCESS', 'FAILED');

-- CreateEnum
CREATE TYPE "LedgerEntryType" AS ENUM ('WALLET_TOPUP', 'P2P_SEND', 'P2P_RECEIVE', 'MERCHANT_PAYMENT', 'MERCHANT_REFUND', 'PAYMENT_REQUEST_PAID', 'ADMIN_ADJUSTMENT');

-- CreateEnum
CREATE TYPE "OutboxStatus" AS ENUM ('PENDING', 'PROCESSING', 'PUBLISHED', 'FAILED');

-- CreateEnum
CREATE TYPE "TransferStatus" AS ENUM ('SUCCESS', 'FAILED', 'REVERSED');

-- CreateEnum
CREATE TYPE "PaymentRequestStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('PROCESSING', 'INITIATED', 'PENDING', 'SUCCESS', 'FAILED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "BankAccountType" AS ENUM ('SAVINGS', 'CURRENT');

-- CreateEnum
CREATE TYPE "BankAccountStatus" AS ENUM ('PENDING_APPROVAL', 'ACTIVE', 'CLOSED');

-- CreateEnum
CREATE TYPE "ApprovalAction" AS ENUM ('APPROVED', 'REJECTED', 'FROZEN', 'UNFROZEN', 'CLOSED');

-- CreateEnum
CREATE TYPE "BusinessType" AS ENUM ('RETAIL', 'FOOD', 'SERVICES', 'ONLINE', 'OTHER');

-- CreateEnum
CREATE TYPE "MerchantStatus" AS ENUM ('PENDING_APPROVAL', 'ACTIVE', 'SUSPENDED', 'CLOSED');

-- CreateEnum
CREATE TYPE "SettlementStatus" AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "hashedPassword" TEXT NOT NULL,
    "hashedPin" TEXT,
    "role" "UserRole" NOT NULL,
    "isEmailVerified" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastLoginAt" TIMESTAMP(3),
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "trusted_devices" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "deviceId" TEXT NOT NULL,
    "deviceName" TEXT NOT NULL,
    "ipAddress" TEXT NOT NULL,
    "isTrusted" BOOLEAN NOT NULL DEFAULT false,
    "lastUsedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "trusted_devices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "wallets" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "balance" BIGINT NOT NULL DEFAULT 0,
    "status" "WalletStatus" NOT NULL DEFAULT 'PENDING_PIN',
    "isFrozen" BOOLEAN NOT NULL DEFAULT false,
    "qrCode" TEXT NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "wallets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "kyc_profiles" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "walletId" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "dob" DATE NOT NULL,
    "address" JSONB NOT NULL,
    "idType" "IdType" NOT NULL,
    "idNumber" TEXT,
    "idFrontUrl" TEXT,
    "idBackUrl" TEXT,
    "selfieUrl" TEXT,
    "idFrontImage" TEXT,
    "idBackImage" TEXT,
    "selfieImage" TEXT,
    "status" "KycStatus" NOT NULL DEFAULT 'PENDING',
    "verifiedAt" TIMESTAMPTZ,
    "rejectedReason" TEXT,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "kyc_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ledger_entries" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "referenceId" TEXT NOT NULL,
    "entryType" "LedgerEntryType" NOT NULL,
    "amount" BIGINT NOT NULL,
    "balanceBefore" BIGINT NOT NULL,
    "balanceAfter" BIGINT NOT NULL,
    "status" "LedgerStatus" NOT NULL DEFAULT 'PENDING',
    "description" TEXT NOT NULL,
    "notes" TEXT,
    "relatedUserId" TEXT,
    "orderId" TEXT,
    "merchantId" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ledger_entries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "outbox_events" (
    "id" TEXT NOT NULL,
    "exchange" TEXT NOT NULL,
    "routing_key" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "status" "OutboxStatus" NOT NULL DEFAULT 'PENDING',
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "available_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "published_at" TIMESTAMPTZ,
    "last_error" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "outbox_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "idempotency_keys" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "endpoint" TEXT NOT NULL,
    "requestHash" TEXT NOT NULL,
    "responseStatus" INTEGER NOT NULL,
    "responseBody" JSONB NOT NULL,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "idempotency_keys_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "p2p_transfers" (
    "id" TEXT NOT NULL,
    "senderId" TEXT NOT NULL,
    "recipientId" TEXT NOT NULL,
    "amount" BIGINT NOT NULL,
    "note" TEXT,
    "status" "TransferStatus" NOT NULL DEFAULT 'SUCCESS',
    "senderLedgerId" TEXT NOT NULL,
    "recipientLedgerId" TEXT NOT NULL,
    "idempotencyKey" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "p2p_transfers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payment_requests" (
    "id" TEXT NOT NULL,
    "requesterId" TEXT NOT NULL,
    "requestedFromId" TEXT NOT NULL,
    "amount" BIGINT NOT NULL,
    "reason" TEXT,
    "status" "PaymentRequestStatus" NOT NULL DEFAULT 'PENDING',
    "transferId" TEXT,
    "expiresAt" TIMESTAMPTZ NOT NULL,
    "respondedAt" TIMESTAMPTZ,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "payment_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payment_orders" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "amount" BIGINT NOT NULL,
    "status" "OrderStatus" NOT NULL DEFAULT 'INITIATED',
    "failureReason" TEXT,
    "failureCode" TEXT,
    "idempotencyKey" TEXT NOT NULL,
    "ledgerId" TEXT,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "payment_orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bank_accounts" (
    "id" TEXT NOT NULL,
    "accountNumber" TEXT NOT NULL,
    "bankName" TEXT NOT NULL,
    "accountHolder" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "balance" BIGINT NOT NULL DEFAULT 0,
    "accountType" "BankAccountType" NOT NULL DEFAULT 'SAVINGS',
    "ifscCode" TEXT NOT NULL,
    "branch" TEXT NOT NULL,
    "status" "BankAccountStatus" NOT NULL DEFAULT 'PENDING_APPROVAL',
    "isFrozen" BOOLEAN NOT NULL DEFAULT false,
    "freezeReason" TEXT,
    "approvedBy" TEXT,
    "approvedAt" TIMESTAMPTZ,
    "version" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "bank_accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "linked_bank_accounts" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "bankName" TEXT NOT NULL,
    "maskedAccount" TEXT NOT NULL,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "linked_bank_accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bank_account_approvals" (
    "id" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "adminId" TEXT NOT NULL,
    "action" "ApprovalAction" NOT NULL,
    "reason" TEXT,
    "comments" TEXT,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "bank_account_approvals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bank_admins" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "bankName" TEXT NOT NULL,
    "permissions" JSONB NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "bank_admins_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "merchants" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "businessName" TEXT NOT NULL,
    "businessType" "BusinessType" NOT NULL,
    "businessCategory" TEXT NOT NULL,
    "gstNumber" TEXT,
    "panNumber" TEXT NOT NULL,
    "address" JSONB NOT NULL,
    "merchantQrCode" TEXT NOT NULL,
    "balance" BIGINT NOT NULL DEFAULT 0,
    "pendingBalance" BIGINT NOT NULL DEFAULT 0,
    "commissionRate" DECIMAL(5,2) NOT NULL DEFAULT 2.0,
    "status" "MerchantStatus" NOT NULL DEFAULT 'PENDING_APPROVAL',
    "isFrozen" BOOLEAN NOT NULL DEFAULT false,
    "settlementBankAccountId" TEXT,
    "approvedAt" TIMESTAMPTZ,
    "version" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "merchants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "merchant_payments" (
    "id" TEXT NOT NULL,
    "merchantId" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "amount" BIGINT NOT NULL,
    "commission" BIGINT NOT NULL,
    "netAmount" BIGINT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'SUCCESS',
    "settlementId" TEXT,
    "settledAt" TIMESTAMPTZ,
    "customerLedgerId" TEXT NOT NULL,
    "idempotencyKey" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "merchant_payments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "refunds" (
    "id" TEXT NOT NULL,
    "merchantId" TEXT NOT NULL,
    "paymentId" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "amount" BIGINT NOT NULL,
    "reason" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'COMPLETED',
    "merchantLedgerId" TEXT NOT NULL,
    "customerLedgerId" TEXT NOT NULL,
    "idempotencyKey" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "refunds_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "settlements" (
    "id" TEXT NOT NULL,
    "merchantId" TEXT NOT NULL,
    "amount" BIGINT NOT NULL,
    "commission" BIGINT NOT NULL,
    "settledAmount" BIGINT NOT NULL,
    "bankAccountId" TEXT NOT NULL,
    "status" "SettlementStatus" NOT NULL DEFAULT 'PENDING',
    "utrNumber" TEXT,
    "requestedAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMPTZ,

    CONSTRAINT "settlements_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_phone_key" ON "users"("phone");

-- CreateIndex
CREATE INDEX "users_email_idx" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_phone_idx" ON "users"("phone");

-- CreateIndex
CREATE INDEX "users_role_isActive_idx" ON "users"("role", "isActive");

-- CreateIndex
CREATE INDEX "trusted_devices_userId_isTrusted_idx" ON "trusted_devices"("userId", "isTrusted");

-- CreateIndex
CREATE UNIQUE INDEX "trusted_devices_userId_deviceId_key" ON "trusted_devices"("userId", "deviceId");

-- CreateIndex
CREATE UNIQUE INDEX "wallets_userId_key" ON "wallets"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "wallets_qrCode_key" ON "wallets"("qrCode");

-- CreateIndex
CREATE INDEX "wallets_userId_idx" ON "wallets"("userId");

-- CreateIndex
CREATE INDEX "wallets_status_isFrozen_idx" ON "wallets"("status", "isFrozen");

-- CreateIndex
CREATE INDEX "wallets_qrCode_idx" ON "wallets"("qrCode");

-- CreateIndex
CREATE UNIQUE INDEX "kyc_profiles_userId_key" ON "kyc_profiles"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "kyc_profiles_walletId_key" ON "kyc_profiles"("walletId");

-- CreateIndex
CREATE INDEX "kyc_profiles_userId_idx" ON "kyc_profiles"("userId");

-- CreateIndex
CREATE INDEX "kyc_profiles_status_idx" ON "kyc_profiles"("status");

-- CreateIndex
CREATE UNIQUE INDEX "ledger_entries_referenceId_key" ON "ledger_entries"("referenceId");

-- CreateIndex
CREATE INDEX "ledger_entries_userId_createdAt_idx" ON "ledger_entries"("userId", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "ledger_entries_userId_entryType_idx" ON "ledger_entries"("userId", "entryType");

-- CreateIndex
CREATE INDEX "ledger_entries_userId_entryType_createdAt_idx" ON "ledger_entries"("userId", "entryType", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "ledger_entries_userId_status_createdAt_idx" ON "ledger_entries"("userId", "status", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "ledger_entries_referenceId_idx" ON "ledger_entries"("referenceId");

-- CreateIndex
CREATE INDEX "ledger_entries_relatedUserId_idx" ON "ledger_entries"("relatedUserId");

-- CreateIndex
CREATE INDEX "ledger_entries_status_idx" ON "ledger_entries"("status");

-- CreateIndex
CREATE INDEX "ledger_entries_orderId_idx" ON "ledger_entries"("orderId");

-- CreateIndex
CREATE INDEX "ledger_entries_createdAt_idx" ON "ledger_entries"("createdAt" DESC);

-- CreateIndex
CREATE INDEX "outbox_events_status_available_at_idx" ON "outbox_events"("status", "available_at");

-- CreateIndex
CREATE INDEX "outbox_events_created_at_idx" ON "outbox_events"("created_at" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "idempotency_keys_key_key" ON "idempotency_keys"("key");

-- CreateIndex
CREATE INDEX "idempotency_keys_key_idx" ON "idempotency_keys"("key");

-- CreateIndex
CREATE INDEX "idempotency_keys_userId_endpoint_idx" ON "idempotency_keys"("userId", "endpoint");

-- CreateIndex
CREATE INDEX "idempotency_keys_expiresAt_idx" ON "idempotency_keys"("expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "p2p_transfers_senderLedgerId_key" ON "p2p_transfers"("senderLedgerId");

-- CreateIndex
CREATE UNIQUE INDEX "p2p_transfers_recipientLedgerId_key" ON "p2p_transfers"("recipientLedgerId");

-- CreateIndex
CREATE UNIQUE INDEX "p2p_transfers_idempotencyKey_key" ON "p2p_transfers"("idempotencyKey");

-- CreateIndex
CREATE INDEX "p2p_transfers_senderId_createdAt_idx" ON "p2p_transfers"("senderId", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "p2p_transfers_recipientId_createdAt_idx" ON "p2p_transfers"("recipientId", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "p2p_transfers_idempotencyKey_idx" ON "p2p_transfers"("idempotencyKey");

-- CreateIndex
CREATE UNIQUE INDEX "payment_requests_transferId_key" ON "payment_requests"("transferId");

-- CreateIndex
CREATE INDEX "payment_requests_requesterId_status_idx" ON "payment_requests"("requesterId", "status");

-- CreateIndex
CREATE INDEX "payment_requests_requesterId_status_createdAt_idx" ON "payment_requests"("requesterId", "status", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "payment_requests_requestedFromId_status_idx" ON "payment_requests"("requestedFromId", "status");

-- CreateIndex
CREATE INDEX "payment_requests_requestedFromId_status_createdAt_idx" ON "payment_requests"("requestedFromId", "status", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "payment_requests_expiresAt_idx" ON "payment_requests"("expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "payment_orders_idempotencyKey_key" ON "payment_orders"("idempotencyKey");

-- CreateIndex
CREATE UNIQUE INDEX "payment_orders_ledgerId_key" ON "payment_orders"("ledgerId");

-- CreateIndex
CREATE INDEX "payment_orders_userId_status_idx" ON "payment_orders"("userId", "status");

-- CreateIndex
CREATE INDEX "payment_orders_userId_createdAt_idx" ON "payment_orders"("userId", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "payment_orders_status_createdAt_idx" ON "payment_orders"("status", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "payment_orders_idempotencyKey_idx" ON "payment_orders"("idempotencyKey");

-- CreateIndex
CREATE INDEX "payment_orders_status_idx" ON "payment_orders"("status");

-- CreateIndex
CREATE INDEX "bank_accounts_userId_idx" ON "bank_accounts"("userId");

-- CreateIndex
CREATE INDEX "bank_accounts_status_idx" ON "bank_accounts"("status");

-- CreateIndex
CREATE INDEX "bank_accounts_email_bankName_idx" ON "bank_accounts"("email", "bankName");

-- CreateIndex
CREATE UNIQUE INDEX "bank_accounts_accountNumber_bankName_key" ON "bank_accounts"("accountNumber", "bankName");

-- CreateIndex
CREATE INDEX "linked_bank_accounts_userId_idx" ON "linked_bank_accounts"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "linked_bank_accounts_userId_accountId_key" ON "linked_bank_accounts"("userId", "accountId");

-- CreateIndex
CREATE INDEX "bank_account_approvals_accountId_idx" ON "bank_account_approvals"("accountId");

-- CreateIndex
CREATE UNIQUE INDEX "bank_admins_userId_key" ON "bank_admins"("userId");

-- CreateIndex
CREATE INDEX "bank_admins_userId_idx" ON "bank_admins"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "merchants_userId_key" ON "merchants"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "merchants_merchantQrCode_key" ON "merchants"("merchantQrCode");

-- CreateIndex
CREATE INDEX "merchants_userId_idx" ON "merchants"("userId");

-- CreateIndex
CREATE INDEX "merchants_status_idx" ON "merchants"("status");

-- CreateIndex
CREATE INDEX "merchants_merchantQrCode_idx" ON "merchants"("merchantQrCode");

-- CreateIndex
CREATE UNIQUE INDEX "merchant_payments_customerLedgerId_key" ON "merchant_payments"("customerLedgerId");

-- CreateIndex
CREATE UNIQUE INDEX "merchant_payments_idempotencyKey_key" ON "merchant_payments"("idempotencyKey");

-- CreateIndex
CREATE INDEX "merchant_payments_merchantId_status_idx" ON "merchant_payments"("merchantId", "status");

-- CreateIndex
CREATE INDEX "merchant_payments_merchantId_createdAt_idx" ON "merchant_payments"("merchantId", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "merchant_payments_merchantId_settledAt_idx" ON "merchant_payments"("merchantId", "settledAt");

-- CreateIndex
CREATE INDEX "merchant_payments_idempotencyKey_idx" ON "merchant_payments"("idempotencyKey");

-- CreateIndex
CREATE UNIQUE INDEX "refunds_merchantLedgerId_key" ON "refunds"("merchantLedgerId");

-- CreateIndex
CREATE UNIQUE INDEX "refunds_customerLedgerId_key" ON "refunds"("customerLedgerId");

-- CreateIndex
CREATE UNIQUE INDEX "refunds_idempotencyKey_key" ON "refunds"("idempotencyKey");

-- CreateIndex
CREATE INDEX "refunds_merchantId_createdAt_idx" ON "refunds"("merchantId", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "refunds_paymentId_idx" ON "refunds"("paymentId");

-- CreateIndex
CREATE INDEX "refunds_idempotencyKey_idx" ON "refunds"("idempotencyKey");

-- CreateIndex
CREATE INDEX "settlements_merchantId_status_idx" ON "settlements"("merchantId", "status");

-- CreateIndex
CREATE INDEX "settlements_merchantId_requestedAt_idx" ON "settlements"("merchantId", "requestedAt" DESC);

-- AddForeignKey
ALTER TABLE "trusted_devices" ADD CONSTRAINT "trusted_devices_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "wallets" ADD CONSTRAINT "wallets_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kyc_profiles" ADD CONSTRAINT "kyc_profiles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ledger_entries" ADD CONSTRAINT "ledger_entries_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ledger_entries" ADD CONSTRAINT "ledger_entries_relatedUserId_fkey" FOREIGN KEY ("relatedUserId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ledger_entries" ADD CONSTRAINT "ledger_entries_merchantId_fkey" FOREIGN KEY ("merchantId") REFERENCES "merchants"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "p2p_transfers" ADD CONSTRAINT "p2p_transfers_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "p2p_transfers" ADD CONSTRAINT "p2p_transfers_recipientId_fkey" FOREIGN KEY ("recipientId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment_requests" ADD CONSTRAINT "payment_requests_requesterId_fkey" FOREIGN KEY ("requesterId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment_requests" ADD CONSTRAINT "payment_requests_requestedFromId_fkey" FOREIGN KEY ("requestedFromId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment_orders" ADD CONSTRAINT "payment_orders_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment_orders" ADD CONSTRAINT "payment_orders_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "bank_accounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment_orders" ADD CONSTRAINT "payment_orders_ledgerId_fkey" FOREIGN KEY ("ledgerId") REFERENCES "ledger_entries"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bank_accounts" ADD CONSTRAINT "bank_accounts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "linked_bank_accounts" ADD CONSTRAINT "linked_bank_accounts_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "bank_accounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bank_account_approvals" ADD CONSTRAINT "bank_account_approvals_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "bank_accounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bank_admins" ADD CONSTRAINT "bank_admins_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "merchants" ADD CONSTRAINT "merchants_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "merchant_payments" ADD CONSTRAINT "merchant_payments_merchantId_fkey" FOREIGN KEY ("merchantId") REFERENCES "merchants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "merchant_payments" ADD CONSTRAINT "merchant_payments_settlementId_fkey" FOREIGN KEY ("settlementId") REFERENCES "settlements"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "refunds" ADD CONSTRAINT "refunds_merchantId_fkey" FOREIGN KEY ("merchantId") REFERENCES "merchants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "settlements" ADD CONSTRAINT "settlements_merchantId_fkey" FOREIGN KEY ("merchantId") REFERENCES "merchants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
