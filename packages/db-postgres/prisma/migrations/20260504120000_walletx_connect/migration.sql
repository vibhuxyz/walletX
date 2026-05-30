-- WalletX Connect partner API and hosted onboarding.

CREATE TYPE "PartnerAppStatus" AS ENUM ('ACTIVE', 'SUSPENDED');
CREATE TYPE "PartnerWalletLinkStatus" AS ENUM ('ACTIVE', 'REVOKED');
CREATE TYPE "ConnectOnboardingSessionStatus" AS ENUM ('PENDING', 'COMPLETED', 'EXPIRED', 'CANCELLED');
CREATE TYPE "WalletHoldStatus" AS ENUM ('ACTIVE', 'CAPTURED', 'RELEASED');

ALTER TYPE "LedgerEntryType" ADD VALUE 'PARTNER_HOLD_CAPTURE';
ALTER TYPE "LedgerEntryType" ADD VALUE 'PARTNER_CREDIT';

CREATE TABLE "partner_apps" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "apiKey" TEXT NOT NULL,
  "apiSecretHash" TEXT NOT NULL,
  "redirectUris" TEXT[],
  "scopes" TEXT[],
  "status" "PartnerAppStatus" NOT NULL DEFAULT 'ACTIVE',
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMPTZ NOT NULL,
  CONSTRAINT "partner_apps_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "partner_wallet_links" (
  "id" TEXT NOT NULL,
  "partnerId" TEXT NOT NULL,
  "partnerUserId" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "walletId" TEXT NOT NULL,
  "status" "PartnerWalletLinkStatus" NOT NULL DEFAULT 'ACTIVE',
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMPTZ NOT NULL,
  CONSTRAINT "partner_wallet_links_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "connect_onboarding_sessions" (
  "id" TEXT NOT NULL,
  "partnerId" TEXT NOT NULL,
  "partnerUserId" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "phone" TEXT,
  "fullName" TEXT,
  "redirectUrl" TEXT NOT NULL,
  "status" "ConnectOnboardingSessionStatus" NOT NULL DEFAULT 'PENDING',
  "userId" TEXT,
  "walletId" TEXT,
  "authCode" TEXT,
  "authCodeHash" TEXT,
  "completedAt" TIMESTAMPTZ,
  "expiresAt" TIMESTAMPTZ NOT NULL,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMPTZ NOT NULL,
  CONSTRAINT "connect_onboarding_sessions_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "wallet_holds" (
  "id" TEXT NOT NULL,
  "partnerId" TEXT NOT NULL,
  "walletId" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "amount" BIGINT NOT NULL,
  "currency" TEXT NOT NULL DEFAULT 'INR',
  "reason" TEXT NOT NULL,
  "referenceId" TEXT NOT NULL,
  "idempotencyKey" TEXT NOT NULL,
  "status" "WalletHoldStatus" NOT NULL DEFAULT 'ACTIVE',
  "capturedLedgerId" TEXT,
  "capturedAt" TIMESTAMPTZ,
  "releasedAt" TIMESTAMPTZ,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMPTZ NOT NULL,
  CONSTRAINT "wallet_holds_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "partner_apps_apiKey_key" ON "partner_apps"("apiKey");
CREATE INDEX "partner_apps_apiKey_idx" ON "partner_apps"("apiKey");
CREATE INDEX "partner_apps_status_idx" ON "partner_apps"("status");

CREATE UNIQUE INDEX "partner_wallet_links_partnerId_partnerUserId_key" ON "partner_wallet_links"("partnerId", "partnerUserId");
CREATE UNIQUE INDEX "partner_wallet_links_partnerId_userId_key" ON "partner_wallet_links"("partnerId", "userId");
CREATE INDEX "partner_wallet_links_partnerId_walletId_idx" ON "partner_wallet_links"("partnerId", "walletId");
CREATE INDEX "partner_wallet_links_userId_idx" ON "partner_wallet_links"("userId");

CREATE UNIQUE INDEX "connect_onboarding_sessions_authCode_key" ON "connect_onboarding_sessions"("authCode");
CREATE INDEX "connect_onboarding_sessions_partnerId_partnerUserId_idx" ON "connect_onboarding_sessions"("partnerId", "partnerUserId");
CREATE INDEX "connect_onboarding_sessions_status_expiresAt_idx" ON "connect_onboarding_sessions"("status", "expiresAt");
CREATE INDEX "connect_onboarding_sessions_authCode_idx" ON "connect_onboarding_sessions"("authCode");

CREATE UNIQUE INDEX "wallet_holds_partnerId_idempotencyKey_key" ON "wallet_holds"("partnerId", "idempotencyKey");
CREATE UNIQUE INDEX "wallet_holds_capturedLedgerId_key" ON "wallet_holds"("capturedLedgerId");
CREATE INDEX "wallet_holds_partnerId_referenceId_idx" ON "wallet_holds"("partnerId", "referenceId");
CREATE INDEX "wallet_holds_walletId_status_idx" ON "wallet_holds"("walletId", "status");
CREATE INDEX "wallet_holds_userId_status_idx" ON "wallet_holds"("userId", "status");

ALTER TABLE "partner_wallet_links" ADD CONSTRAINT "partner_wallet_links_partnerId_fkey" FOREIGN KEY ("partnerId") REFERENCES "partner_apps"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "partner_wallet_links" ADD CONSTRAINT "partner_wallet_links_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "partner_wallet_links" ADD CONSTRAINT "partner_wallet_links_walletId_fkey" FOREIGN KEY ("walletId") REFERENCES "wallets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "connect_onboarding_sessions" ADD CONSTRAINT "connect_onboarding_sessions_partnerId_fkey" FOREIGN KEY ("partnerId") REFERENCES "partner_apps"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "connect_onboarding_sessions" ADD CONSTRAINT "connect_onboarding_sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "connect_onboarding_sessions" ADD CONSTRAINT "connect_onboarding_sessions_walletId_fkey" FOREIGN KEY ("walletId") REFERENCES "wallets"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "wallet_holds" ADD CONSTRAINT "wallet_holds_partnerId_fkey" FOREIGN KEY ("partnerId") REFERENCES "partner_apps"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "wallet_holds" ADD CONSTRAINT "wallet_holds_walletId_fkey" FOREIGN KEY ("walletId") REFERENCES "wallets"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "wallet_holds" ADD CONSTRAINT "wallet_holds_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
