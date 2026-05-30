import { ENV } from "@repo/config";
import { enqueueOutboxEventTx, prismaPostgres } from "@repo/db-postgres";
import { ApiError, Currency, generateTransactionId, Logger } from "@repo/libs";
import { invalidateWalletReadCaches } from "@repo/redis";
import { Exchanges, RoutingKeys } from "@repo/rabbitmq";
import crypto from "crypto";
import { nanoid } from "nanoid";

const logger = new Logger("connect.service");

const prisma = prismaPostgres as any;
const SESSION_TTL_MINUTES = 30;

function sha256(value: string) {
  return crypto.createHash("sha256").update(value).digest("hex");
}

function randomSecret(prefix: string) {
  return `${prefix}_${crypto.randomBytes(24).toString("base64url")}`;
}

function assertRedirectAllowed(redirectUrl: string, allowedUris: string[]) {
  if (!allowedUris.includes(redirectUrl)) {
    throw new ApiError(
      400,
      "REDIRECT_URI_NOT_ALLOWED",
      "redirectUrl is not registered for this partner",
    );
  }
}

async function getActiveHoldTotal(walletId: string, tx = prisma) {
  const aggregate = await tx.walletHold.aggregate({
    where: { walletId, status: "ACTIVE" },
    _sum: { amount: true },
  });

  return BigInt(aggregate._sum.amount ?? 0);
}

async function ensurePartnerWalletLink(partnerId: string, walletId: string) {
  const link = await prisma.partnerWalletLink.findFirst({
    where: { partnerId, walletId, status: "ACTIVE" },
    select: { id: true, userId: true, walletId: true, partnerUserId: true },
  });

  if (!link) {
    throw new ApiError(
      404,
      "PARTNER_WALLET_LINK_NOT_FOUND",
      "Wallet is not linked to this partner",
    );
  }

  return link;
}

async function ensureSpendableWallet(walletId: string, partnerId: string) {
  const link = await ensurePartnerWalletLink(partnerId, walletId);

  const wallet = await prisma.wallet.findUnique({
    where: { id: walletId },
    select: {
      id: true,
      userId: true,
      balance: true,
      status: true,
      isFrozen: true,
      updatedAt: true,
    },
  });

  if (!wallet) {
    throw new ApiError(404, "WALLET_NOT_FOUND", "Wallet not found");
  }

  if (wallet.status !== "ACTIVE") {
    throw new ApiError(400, "WALLET_NOT_ACTIVE", "Wallet is not active");
  }

  if (wallet.isFrozen) {
    throw new ApiError(400, "WALLET_FROZEN", "Wallet is frozen");
  }

  return { wallet, link };
}

export async function createPartner(input: {
  name: string;
  redirectUris: string[];
  scopes: string[];
}) {
  const apiKey = randomSecret("wxpk");
  const apiSecret = randomSecret("wxsk");

  const partner = await prisma.partnerApp.create({
    data: {
      name: input.name,
      apiKey,
      apiSecretHash: sha256(apiSecret),
      redirectUris: input.redirectUris,
      scopes: input.scopes,
    },
    select: {
      id: true,
      name: true,
      apiKey: true,
      redirectUris: true,
      scopes: true,
      status: true,
      createdAt: true,
    },
  });

  return { ...partner, apiSecret };
}

export async function listPartners() {
  const partners = await prisma.partnerApp.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      apiKey: true,
      redirectUris: true,
      scopes: true,
      status: true,
      createdAt: true,
      updatedAt: true,
      _count: {
        select: {
          walletLinks: true,
          sessions: true,
          walletHolds: true,
        },
      },
    },
  });

  return partners.map((partner: any) => ({
    id: partner.id,
    name: partner.name,
    apiKey: partner.apiKey,
    redirectUris: partner.redirectUris,
    scopes: partner.scopes,
    status: partner.status,
    createdAt: partner.createdAt.toISOString(),
    updatedAt: partner.updatedAt.toISOString(),
    counts: {
      walletLinks: partner._count.walletLinks,
      onboardingSessions: partner._count.sessions,
      holds: partner._count.walletHolds,
    },
  }));
}

export async function createOnboardingSession(
  partner: { id: string; redirectUris: string[] },
  input: {
    partnerUserId: string;
    email: string;
    phone?: string;
    fullName?: string;
    redirectUrl: string;
  },
) {
  assertRedirectAllowed(input.redirectUrl, partner.redirectUris);

  const expiresAt = new Date(Date.now() + SESSION_TTL_MINUTES * 60 * 1000);

  const session = await prisma.connectOnboardingSession.create({
    data: {
      id: `cos_${nanoid(21)}`,
      partnerId: partner.id,
      partnerUserId: input.partnerUserId,
      email: input.email.toLowerCase(),
      phone: input.phone,
      fullName: input.fullName,
      redirectUrl: input.redirectUrl,
      expiresAt,
    },
    include: {
      partner: { select: { id: true, name: true } },
    },
  });

  return {
    sessionId: session.id,
    onboardingUrl: `${ENV.FRONTEND_URL}/connect/onboard/${session.id}`,
    expiresAt: session.expiresAt.toISOString(),
    partner: session.partner,
  };
}

export async function getOnboardingSession(sessionId: string) {
  const session = await prisma.connectOnboardingSession.findUnique({
    where: { id: sessionId },
    include: {
      partner: { select: { id: true, name: true } },
    },
  });

  if (!session) {
    throw new ApiError(404, "CONNECT_SESSION_NOT_FOUND", "Session not found");
  }

  if (session.status === "PENDING" && session.expiresAt <= new Date()) {
    await prisma.connectOnboardingSession.update({
      where: { id: session.id },
      data: { status: "EXPIRED" },
    });
    session.status = "EXPIRED";
  }

  return {
    id: session.id,
    partner: session.partner,
    partnerUserId: session.partnerUserId,
    email: session.email,
    phone: session.phone,
    fullName: session.fullName,
    status: session.status,
    expiresAt: session.expiresAt.toISOString(),
  };
}

export async function completeOnboardingSession(
  sessionId: string,
  userId: string,
) {
  const session = await prisma.connectOnboardingSession.findUnique({
    where: { id: sessionId },
    include: { partner: true },
  });

  if (!session) {
    throw new ApiError(404, "CONNECT_SESSION_NOT_FOUND", "Session not found");
  }

  if (session.status !== "PENDING") {
    throw new ApiError(
      400,
      "CONNECT_SESSION_NOT_PENDING",
      `Session is ${session.status}`,
    );
  }

  if (session.expiresAt <= new Date()) {
    await prisma.connectOnboardingSession.update({
      where: { id: session.id },
      data: { status: "EXPIRED" },
    });
    throw new ApiError(400, "CONNECT_SESSION_EXPIRED", "Session expired");
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { wallet: true, kycProfile: true },
  });

  if (!user || !user.wallet) {
    throw new ApiError(404, "WALLET_NOT_FOUND", "Wallet not found");
  }

  if (user.email.toLowerCase() !== session.email.toLowerCase()) {
    throw new ApiError(
      409,
      "EMAIL_MISMATCH",
      "WalletX account email must match the partner account email",
    );
  }

  if (user.wallet.status === "PENDING_PIN") {
    throw new ApiError(400, "PIN_REQUIRED", "Create wallet PIN first");
  }

  if (user.wallet.status !== "ACTIVE") {
    throw new ApiError(400, "KYC_REQUIRED", "Complete KYC first");
  }

  const authCode = randomSecret("wxc");

  const result = await prisma.$transaction(async (tx: any) => {
    const link = await tx.partnerWalletLink.upsert({
      where: {
        partnerId_partnerUserId: {
          partnerId: session.partnerId,
          partnerUserId: session.partnerUserId,
        },
      },
      update: {
        userId: user.id,
        walletId: user.wallet.id,
        status: "ACTIVE",
      },
      create: {
        partnerId: session.partnerId,
        partnerUserId: session.partnerUserId,
        userId: user.id,
        walletId: user.wallet.id,
      },
    });

    const completed = await tx.connectOnboardingSession.update({
      where: { id: session.id },
      data: {
        status: "COMPLETED",
        userId: user.id,
        walletId: user.wallet.id,
        authCode,
        authCodeHash: sha256(authCode),
        completedAt: new Date(),
      },
    });

    return { link, completed };
  });

  const redirectUrl = new URL(session.redirectUrl);
  redirectUrl.searchParams.set("code", authCode);
  redirectUrl.searchParams.set("session_id", session.id);

  logger.info("Connect onboarding completed", {
    sessionId: session.id,
    partnerId: session.partnerId,
    userId: user.id,
  });

  return {
    redirectUrl: redirectUrl.toString(),
    walletUserId: result.link.userId,
    walletId: result.link.walletId,
    status: result.completed.status,
  };
}

export async function exchangeToken(partnerId: string, code: string) {
  const session = await prisma.connectOnboardingSession.findFirst({
    where: {
      partnerId,
      authCode: code,
      status: "COMPLETED",
    },
    include: {
      wallet: {
        select: { id: true, status: true, isFrozen: true },
      },
      user: {
        select: {
          id: true,
          email: true,
          phone: true,
          fullName: true,
          kycProfile: { select: { status: true } },
        },
      },
    },
  });

  if (!session || session.authCodeHash !== sha256(code)) {
    throw new ApiError(400, "INVALID_CONNECT_CODE", "Invalid connect code");
  }

  await prisma.connectOnboardingSession.update({
    where: { id: session.id },
    data: { authCode: null },
  });

  return {
    walletUserId: session.userId,
    walletId: session.walletId,
    partnerUserId: session.partnerUserId,
    walletStatus: session.wallet?.status,
    kycStatus: session.user?.kycProfile?.status ?? "PENDING",
    user: {
      email: session.user?.email,
      phone: session.user?.phone,
      fullName: session.user?.fullName,
    },
  };
}

export async function getPartnerWalletBalance(
  partnerId: string,
  walletId: string,
) {
  await ensurePartnerWalletLink(partnerId, walletId);

  const wallet = await prisma.wallet.findUnique({
    where: { id: walletId },
    select: {
      id: true,
      userId: true,
      balance: true,
      status: true,
      isFrozen: true,
      updatedAt: true,
    },
  });

  if (!wallet) {
    throw new ApiError(404, "WALLET_NOT_FOUND", "Wallet not found");
  }

  const reserved = await getActiveHoldTotal(walletId);
  const isLocked =
    wallet.status === "PENDING_KYC" ||
    wallet.status === "PENDING_PIN" ||
    wallet.isFrozen ||
    wallet.status === "SUSPENDED";
  const available = isLocked ? 0n : wallet.balance - reserved;

  return {
    walletId: wallet.id,
    walletUserId: wallet.userId,
    totalBalance: Currency.toRupees(wallet.balance),
    availableBalance: Currency.toRupees(available > 0n ? available : 0n),
    reservedBalance: Currency.toRupees(reserved),
    currency: "INR",
    status: wallet.status,
    isFrozen: wallet.isFrozen,
    lastUpdated: wallet.updatedAt.toISOString(),
  };
}

export async function createHold(
  partnerId: string,
  walletId: string,
  input: {
    amount: string;
    currency: "INR";
    reason: string;
    referenceId: string;
    idempotencyKey: string;
  },
) {
  const amount = Currency.toPaise(input.amount);
  const { wallet } = await ensureSpendableWallet(walletId, partnerId);

  const existing = await prisma.walletHold.findUnique({
    where: {
      partnerId_idempotencyKey: {
        partnerId,
        idempotencyKey: input.idempotencyKey,
      },
    },
  });

  if (existing) {
    return formatHold(existing);
  }

  const hold = await prisma.$transaction(
    async (tx: any) => {
      const currentWallet = await tx.wallet.findUnique({
        where: { id: walletId },
        select: { balance: true, status: true, isFrozen: true },
      });

      if (!currentWallet) {
        throw new ApiError(404, "WALLET_NOT_FOUND", "Wallet not found");
      }

      if (currentWallet.status !== "ACTIVE" || currentWallet.isFrozen) {
        throw new ApiError(400, "WALLET_NOT_ACTIVE", "Wallet is not active");
      }

      const reserved = await getActiveHoldTotal(walletId, tx);
      const available = currentWallet.balance - reserved;

      if (available < amount) {
        throw new ApiError(
          400,
          "INSUFFICIENT_AVAILABLE_BALANCE",
          "Insufficient available wallet balance",
        );
      }

      return tx.walletHold.create({
        data: {
          id: `hold_${nanoid(21)}`,
          partnerId,
          walletId,
          userId: wallet.userId,
          amount,
          currency: input.currency,
          reason: input.reason,
          referenceId: input.referenceId,
          idempotencyKey: input.idempotencyKey,
        },
      });
    },
    { isolationLevel: "Serializable" },
  );

  await invalidateWalletReadCaches(wallet.userId);
  return formatHold(hold);
}

export async function captureHold(partnerId: string, holdId: string) {
  const hold = await prisma.walletHold.findFirst({
    where: { id: holdId, partnerId },
    include: { wallet: true },
  });

  if (!hold) {
    throw new ApiError(404, "HOLD_NOT_FOUND", "Hold not found");
  }

  if (hold.status === "CAPTURED") {
    return formatHold(hold);
  }

  if (hold.status !== "ACTIVE") {
    throw new ApiError(400, "HOLD_NOT_ACTIVE", `Hold is ${hold.status}`);
  }

  const updated = await prisma.$transaction(async (tx: any) => {
    const wallet = await tx.wallet.findUnique({
      where: { id: hold.walletId },
      select: { balance: true, version: true },
    });

    if (!wallet || wallet.balance < hold.amount) {
      throw new ApiError(
        400,
        "INSUFFICIENT_BALANCE",
        "Insufficient wallet balance",
      );
    }

    const balanceAfter = wallet.balance - hold.amount;
    const ledger = await tx.ledgerEntry.create({
      data: {
        userId: hold.userId,
        referenceId: generateTransactionId("WXC"),
        entryType: "PARTNER_HOLD_CAPTURE",
        amount: -hold.amount,
        balanceBefore: wallet.balance,
        balanceAfter,
        status: "SUCCESS",
        description: `Partner hold captured: ${hold.reason}`,
        metadata: {
          partnerId,
          holdId: hold.id,
          referenceId: hold.referenceId,
        },
      },
    });

    await tx.wallet.update({
      where: { id: hold.walletId },
      data: { balance: balanceAfter, version: { increment: 1 } },
    });

    const captured = await tx.walletHold.update({
      where: { id: hold.id },
      data: {
        status: "CAPTURED",
        capturedLedgerId: ledger.id,
        capturedAt: new Date(),
      },
    });

    await enqueueOutboxEventTx(tx, {
      exchange: Exchanges.REALTIME_EVENTS,
      routingKey: RoutingKeys.REALTIME_BALANCE,
      payload: {
        userId: hold.userId,
        balance: Currency.toRupees(balanceAfter),
        availableBalance: Currency.toRupees(balanceAfter),
      },
    });

    return captured;
  });

  await invalidateWalletReadCaches(hold.userId);
  return formatHold(updated);
}

export async function releaseHold(partnerId: string, holdId: string) {
  const hold = await prisma.walletHold.findFirst({
    where: { id: holdId, partnerId },
  });

  if (!hold) {
    throw new ApiError(404, "HOLD_NOT_FOUND", "Hold not found");
  }

  if (hold.status === "RELEASED") {
    return formatHold(hold);
  }

  if (hold.status !== "ACTIVE") {
    throw new ApiError(400, "HOLD_NOT_ACTIVE", `Hold is ${hold.status}`);
  }

  const updated = await prisma.walletHold.update({
    where: { id: hold.id },
    data: { status: "RELEASED", releasedAt: new Date() },
  });

  await invalidateWalletReadCaches(hold.userId);
  return formatHold(updated);
}

export async function creditWallet(
  partnerId: string,
  walletId: string,
  input: {
    amount: string;
    currency: "INR";
    reason: string;
    referenceId: string;
    idempotencyKey: string;
  },
) {
  const amount = Currency.toPaise(input.amount);
  const { wallet } = await ensureSpendableWallet(walletId, partnerId);
  const ledgerReferenceId = `WXC:${partnerId}:${input.idempotencyKey}`;

  const existingLedger = await prisma.ledgerEntry.findUnique({
    where: { referenceId: ledgerReferenceId },
  });

  if (existingLedger) {
    return {
      transactionId: existingLedger.referenceId,
      amount: Currency.toRupees(existingLedger.amount),
      balanceAfter: Currency.toRupees(existingLedger.balanceAfter),
      status: existingLedger.status,
    };
  }

  const ledger = await prisma.$transaction(async (tx: any) => {
    const currentWallet = await tx.wallet.findUnique({
      where: { id: wallet.id },
      select: { balance: true },
    });

    if (!currentWallet) {
      throw new ApiError(404, "WALLET_NOT_FOUND", "Wallet not found");
    }

    const balanceAfter = currentWallet.balance + amount;

    const entry = await tx.ledgerEntry.create({
      data: {
        userId: wallet.userId,
        referenceId: ledgerReferenceId,
        entryType: "PARTNER_CREDIT",
        amount,
        balanceBefore: currentWallet.balance,
        balanceAfter,
        status: "SUCCESS",
        description: `Partner credit: ${input.reason}`,
        metadata: {
          partnerId,
          referenceId: input.referenceId,
        },
      },
    });

    await tx.wallet.update({
      where: { id: wallet.id },
      data: { balance: balanceAfter, version: { increment: 1 } },
    });

    await enqueueOutboxEventTx(tx, {
      exchange: Exchanges.REALTIME_EVENTS,
      routingKey: RoutingKeys.REALTIME_BALANCE,
      payload: {
        userId: wallet.userId,
        balance: Currency.toRupees(balanceAfter),
        availableBalance: Currency.toRupees(balanceAfter),
      },
    });

    return entry;
  });

  await invalidateWalletReadCaches(wallet.userId);

  return {
    transactionId: ledger.referenceId,
    amount: Currency.toRupees(ledger.amount),
    balanceAfter: Currency.toRupees(ledger.balanceAfter),
    status: ledger.status,
  };
}

function formatHold(hold: any) {
  return {
    holdId: hold.id,
    walletId: hold.walletId,
    amount: Currency.toRupees(hold.amount),
    currency: hold.currency,
    reason: hold.reason,
    referenceId: hold.referenceId,
    status: hold.status,
    createdAt: hold.createdAt?.toISOString?.() ?? hold.createdAt,
    capturedAt: hold.capturedAt?.toISOString?.() ?? hold.capturedAt,
    releasedAt: hold.releasedAt?.toISOString?.() ?? hold.releasedAt,
  };
}
