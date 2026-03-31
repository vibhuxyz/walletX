import { prismaPostgres } from "../index.js";
import { Currency } from "@repo/libs";

export interface WalletBalanceResponse {
  balance: bigint;
  status: string;
  isFrozen: boolean;
  version: number;
  updatedAt: Date;
}

export interface RecipientResponse {
  userId: string;
  status: string;
  isFrozen: boolean;
  qrCode: string;
  user: {
    fullName: string;
    email: string;
  };
  canReceive: boolean;
}

export async function getWalletBalance(
  userId: string,
): Promise<WalletBalanceResponse | null> {
  return prismaPostgres.wallet.findUnique({
    where: { userId },
    select: {
      balance: true,
      status: true,
      isFrozen: true,
      version: true,
      updatedAt: true,
    },
  });
}

export function calculateAvailableBalance(wallet: {
  balance: bigint;
  status: string;
  isFrozen: boolean;
}) {
  const total = wallet.balance;

  const isLocked =
    wallet.status === "PENDING_KYC" ||
    wallet.status === "PENDING_PIN" ||
    wallet.isFrozen ||
    wallet.status === "SUSPENDED";

  return {
    totalBalance: Currency.toRupees(total),
    availableBalance: isLocked ? "0.00" : Currency.toRupees(total),
    lockedBalance: isLocked ? Currency.toRupees(total) : "0.00",
    canSend: wallet.status === "ACTIVE" && !wallet.isFrozen,
    canReceive:
      ["PENDING_KYC", "ACTIVE"].includes(wallet.status) && !wallet.isFrozen,
  };
}

export const findRecipient = async (
  identifier: string,
): Promise<RecipientResponse | null> => {
  const type = detectIdentifierType(identifier);

  let whereClause: any = {};

  if (type === "email") {
    whereClause = { email: identifier };
  } else if (type === "phone") {
    whereClause = { phone: identifier };
  } else if (type === "wallet_id") {
    return prismaPostgres.wallet
      .findFirst({
        where: { qrCode: identifier },
        select: {
          userId: true,
          status: true,
          isFrozen: true,
          qrCode: true,
          user: { select: { fullName: true, email: true } },
        },
      })
      .then((wallet: any) => {
        if (!wallet) return null;
        return {
          ...wallet,
          canReceive:
            ["PENDING_KYC", "ACTIVE"].includes(wallet.status) &&
            !wallet.isFrozen,
        };
      });
  } else {
    return null;
  }

  const user = await prismaPostgres.user.findUnique({
    where: whereClause,
    select: {
      id: true,
      fullName: true,
      email: true,
      wallet: {
        select: {
          userId: true,
          status: true,
          isFrozen: true,
          qrCode: true,
        },
      },
    },
  });

  if (!user?.wallet) return null;

  return {
    userId: user.wallet.userId,
    status: user.wallet.status,
    isFrozen: user.wallet.isFrozen,
    qrCode: user.wallet.qrCode,
    user: { fullName: user.fullName, email: user.email },
    canReceive:
      ["PENDING_KYC", "ACTIVE"].includes(user.wallet.status) &&
      !user.wallet.isFrozen,
  };
};

export function detectIdentifierType(
  identifier: string,
): "email" | "phone" | "wallet_id" | "unknown" {
  if (identifier.toLowerCase().endsWith("@wallet")) return "wallet_id";
  if (identifier.includes("@")) return "email";
  if (identifier.startsWith("+")) return "phone";
  if (identifier.startsWith("WALLET_")) return "wallet_id";
  return "unknown";
}
