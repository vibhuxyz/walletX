import { prismaPostgres } from "@repo/db-postgres";
import {
  ApiError,
  Currency,
  generateAccountNumber,
  generateBranchName,
  generateIfscCode,
  generateOTP,
  hashOTP,
  Logger,
  verifyOTP,
  verifyPin,
} from "@repo/libs";
import { Exchanges, publishMessage, RoutingKeys } from "@repo/rabbitmq";
import { redis, RedisKeys, RedisTTL } from "@repo/redis";
import { CreateBankAccountInput } from "@repo/zod-schema";
import { nanoid } from "nanoid";

export interface LinkedAccountDTO {
  linkId: string;
  accountId: string;
  bankName: string;
  accountNumber: string;
  accountType: string;
  balance: string;
  status: string;
  isDefault: boolean;
}

interface InitiateBankLinkInput {
  bankName: string;
  accountNumber: string;
  ifscCode: string;
  accountHolder: string;
  accountType: "SAVINGS" | "CURRENT";
}

export interface ConfirmBankLinkResponse {
  message: string;
  account: {
    linkId: string;
    bankName: string;
    maskedAccount: string;
    accountType: string;
    isDefault: boolean;
  };
}

export interface BankAccountResponse {
  accountId: string;
  accountNumber: string;
  bankName: string;
  accountHolder: string;
  email: string | null;
  phone: string | null;
  balance: string;
  accountType: string;
  ifscCode: string;
  branch: string | null;
  status: string;
  isFrozen?: boolean;
  createdAt: Date;
  updatedAt?: Date;
}

const logger = new Logger("account.service");

export const getAvailableBanks = async () => {
  const banks = await prismaPostgres.bankAccount.findMany({
    where: { status: "ACTIVE" },
    select: { bankName: true },
    distinct: ["bankName"],
    orderBy: { bankName: "asc" },
  });

  return banks.map((bank) => bank.bankName);
};

export const getLinkedAccounts = async (
  userId: string,
): Promise<LinkedAccountDTO[]> => {
  const linkedAccounts = await prismaPostgres.linkedBankAccount.findMany({
    where: { userId },
    include: {
      account: {
        select: {
          id: true,
          bankName: true,
          accountNumber: true,
          accountType: true,
          balance: true,
          status: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return linkedAccounts.map((link) => ({
    linkId: link.id,
    accountId: link.account.id,
    bankName: link.bankName,
    accountNumber: link.maskedAccount,
    accountType: link.account.accountType,
    balance: Currency.toRupees(link.account.balance),
    status: link.account.status,
    isDefault: link.isDefault,
  }));
};

export const initiateBankLink = async (
  userId: string,
  input: InitiateBankLinkInput,
) => {
  const { bankName, accountNumber, ifscCode, accountHolder, accountType } =
    input;

  const user = await prismaPostgres.user.findUnique({
    where: { id: userId },
    select: {
      email: true,
      fullName: true,
      hashedPin: true,
    },
  });

  if (!user) {
    throw new ApiError(404, "USER_NOT_FOUND", "User not found");
  }

  const account = await prismaPostgres.bankAccount.findFirst({
    where: {
      accountNumber,
      bankName,
      ifscCode,
      status: "ACTIVE",
    },
    select: {
      id: true,
      accountHolder: true,
      email: true,
      accountType: true,
    },
  });

  if (!account) {
    throw new ApiError(
      404,
      "ACCOUNT_NOT_FOUND",
      "Bank account not found or not active. Please check your details.",
    );
  }

  if (account.accountHolder.toLowerCase() !== accountHolder.toLowerCase()) {
    throw new ApiError(
      400,
      "ACCOUNT_HOLDER_MISMATCH",
      "Account holder name does not match bank records",
    );
  }

  // Verify account type matches
  if (account.accountType !== accountType) {
    throw new ApiError(
      400,
      "ACCOUNT_TYPE_MISMATCH",
      `This is a ${account.accountType} account, not ${accountType}`,
    );
  }

  const existingLink = await prismaPostgres.linkedBankAccount.findFirst({
    where: { userId, accountId: account.id },
  });

  if (existingLink) {
    throw new ApiError(
      400,
      "ALREADY_LINKED",
      "This account is already linked to your wallet",
    );
  }

  const linkToken = `link_${nanoid(32)}`;

  await redis.set(
    RedisKeys.BANK_LINK_SESSION(linkToken),
    JSON.stringify({
      userId,
      accountId: account.id,
      bankEmail: account.email,
      step: "PENDING_PIN",
      createdAt: new Date().toISOString(),
    }),
    "EX",
    600, // 10 minutes
  );

  logger.info("Bank link initiated", { userId, accountId: account.id });

  return {
    linkToken,
    maskedAccount: `******${accountNumber.slice(-4)}`,
    bankName,
    accountType,
    accountHolder,
    message: "Please verify your PIN to proceed",
    expiresIn: 600,
  };
};

export const verifyPinAndSendOTP = async (
  userId: string,
  linkToken: string,
  pin: string,
) => {
  const sessionData = await redis.get(RedisKeys.BANK_LINK_SESSION(linkToken));

  if (!sessionData) {
    throw new ApiError(
      400,
      "SESSION_EXPIRED",
      "Link session expired. Please start again.",
    );
  }

  const session = JSON.parse(sessionData);

  if (session.step !== "PENDING_PIN") {
    throw new ApiError(
      400,
      "INVALID_STEP",
      "Invalid step. Session already processed.",
    );
  }

  const user = await prismaPostgres.user.findUnique({
    where: { id: userId },
    select: { hashedPin: true, fullName: true },
  });

  if (!user) {
    throw new ApiError(404, "USER NOT FOUND", "User not exsists check userId");
  }

  if (!user?.hashedPin) {
    throw new ApiError(400, "PIN_NOT_SET", "PIN not set");
  }

  const isPinValid = await verifyPin(pin, user.hashedPin);
  if (!isPinValid) {
    throw new ApiError(400, "INVALID_PIN", "Invalid PIN");
  }

  logger.info("Account id from session", session.accountId);
  const account = await prismaPostgres.bankAccount.findUnique({
    where: { id: session.accountId },
    select: {
      id: true,
      bankName: true,
      accountNumber: true,
      email: true,
    },
  });

  if (!account) {
    throw new ApiError(404, "ACCOUNT_NOT_FOUND", "Bank account not found");
  }

  // generate otp
  const otp = generateOTP(6);
  const hashedOtp = await hashOTP(otp);

  // Update session - mark as PIN verified, add OTP

  session.step = "PENDING_OTP";
  session.hashedOtp = hashedOtp;
  session.otpAttempts = 0;
  session.pinVerifiedAt = new Date().toISOString();

  await redis.set(
    RedisKeys.BANK_LINK_SESSION(linkToken),
    JSON.stringify(session),
    "EX",
    300, // 5 minutes for OTP
  );

  // Send OTP to bank's registered email

  await publishMessage(Exchanges.NOTIFICATIONS, RoutingKeys.EMAIL_BANK_LINK, {
    to: account.email,
    template: "bank-link-verification",
    data: {
      name: user.fullName,
      otp,
      bankName: account.bankName,
      maskedAccount: `******${account.accountNumber.slice(-4)}`,
    },
  });

  logger.info("Bank link OTP sent", {
    userId,
    accountId: account.id,
    email: account.email,
  });

  return {
    message: "OTP sent to your registered bank email",
    linkToken: linkToken,
    emailHint: `${account.email.slice(0, 3)}***@${account.email.split("@")[1]}`,
    expiresIn: 300,
  };
};

export const confirmBankLink = async (
  userId: string,
  linkToken: string,
  otp: string,
): Promise<ConfirmBankLinkResponse> => {
  const sessionData = await redis.get(RedisKeys.BANK_LINK_SESSION(linkToken));

  if (!sessionData) {
    throw new ApiError(400, "LINK_EXPIRED", "Link session expired or invalid");
  }

  const session = JSON.parse(sessionData);

  if (session.userId !== userId) {
    throw new ApiError(403, "UNAUTHORIZED", "Unauthorized link attempt");
  }

  if (session.step !== "PENDING_OTP") {
    throw new ApiError(400, "INVALID_STEP", "PIN not verified yet");
  }

  const isOtpValid = await verifyOTP(otp, session.hashedOtp);

  if (!isOtpValid) {
    session.otpAttempts = (session.otpAttempts || 0) + 1;
    await redis.set(
      RedisKeys.BANK_LINK_SESSION(linkToken),
      JSON.stringify(session),
      "EX",
      RedisTTL.OTP_BANK_LINK,
    );

    if (session.otpAttempts >= 5) {
      await redis.del(RedisKeys.BANK_LINK_SESSION(linkToken));
      throw new ApiError(
        429,
        "MAX_ATTEMPTS_EXCEEDED",
        "Maximum OTP attempts exceeded",
      );
    }
    throw new ApiError(400, "INVALID_OTP", "Invalid OTP");
  }

  // Get bank account
  const account = await prismaPostgres.bankAccount.findUnique({
    where: { id: session.accountId },
    select: {
      id: true,
      bankName: true,
      accountNumber: true,
      accountType: true,
    },
  });

  if (!account) {
    throw new ApiError(404, "ACCOUNT_NOT_FOUND", "Bank account not found");
  }

  // Check if this is the user's first linked account

  const isFirstAccount =
    (await prismaPostgres.linkedBankAccount.count({ where: { userId } })) === 0;

  const linkedAccount = await prismaPostgres.linkedBankAccount.create({
    data: {
      id: `lnk_${nanoid(21)}`,
      userId,
      accountId: account.id,
      bankName: account.bankName,
      maskedAccount: `******${account.accountNumber.slice(-4)}`,
      isDefault: isFirstAccount,
    },
  });

  // Delete session from Redis
  await redis.del(RedisKeys.BANK_LINK_SESSION(linkToken));

  logger.info("Bank account linked successfully", {
    userId,
    accountId: account.id,
  });

  return {
    message: "Bank account linked successfully",
    account: {
      linkId: linkedAccount.id,
      bankName: account.bankName,
      maskedAccount: linkedAccount.maskedAccount,
      accountType: account.accountType,
      isDefault: linkedAccount.isDefault,
    },
  };
};

export async function createBankAccount(
  userId: string,
  input: CreateBankAccountInput,
): Promise<BankAccountResponse> {
  logger.info("Creating bank account", { userId, bankName: input.bankName });

  // Convert initial balance to BigInt (paise)
  const initialBalance = Currency.toPaise(input.initialBalance);

  // Generate unique account number
  let accountNumber: string;
  let isUnique = false;
  let attempts = 0;
  const maxAttempts = 10;

  while (!isUnique && attempts < maxAttempts) {
    accountNumber = generateAccountNumber();

    // Check if account number already exists for this bank
    const existing = await prismaPostgres.bankAccount.findUnique({
      where: {
        accountNumber_bankName: {
          accountNumber: accountNumber!,
          bankName: input.bankName,
        },
      },
    });

    if (!existing) {
      isUnique = true;
    }
    attempts++;
  }

  if (!isUnique) {
    throw new ApiError(
      500,
      "ACCOUNT_NUMBER_GENERATION_FAILED",
      "Failed to generate unique account number. Please try again.",
    );
  }

  // ✅ Generate IFSC code that matches regex: [A-Z]{4}0[A-Z0-9]{6}
  const ifscCode = generateIfscCode(input.bankName);
  const branch = generateBranchName();

  logger.info("Generated IFSC code", { ifscCode, bankName: input.bankName });

  // Create bank account (auto-approved for demo)
  const bankAccount = await prismaPostgres.bankAccount.create({
    data: {
      userId,
      accountNumber: accountNumber!,
      bankName: input.bankName,
      accountHolder: input.accountHolder,
      email: input.email,
      phone: input.phone,
      balance: initialBalance,
      accountType: input.accountType,
      ifscCode,
      //@ts-ignore
      branch,
      status: "ACTIVE", // ✅ Auto-approved for demo
      isFrozen: false,
      approvedBy: "SYSTEM_AUTO",
      approvedAt: new Date(),
    },
  });

  logger.info("Bank account created successfully", {
    userId,
    accountId: bankAccount.id,
    accountNumber: accountNumber!,
    ifscCode,
    bankName: input.bankName,
  });

  return {
    accountId: bankAccount.id,
    accountNumber: bankAccount.accountNumber,
    bankName: bankAccount.bankName,
    accountHolder: bankAccount.accountHolder,
    email: bankAccount.email,
    phone: bankAccount.phone,
    balance: Currency.toRupees(bankAccount.balance),
    accountType: bankAccount.accountType,
    ifscCode: bankAccount.ifscCode,
    branch: bankAccount.branch,
    status: bankAccount.status,
    createdAt: bankAccount.createdAt,
  };
}

export async function getUserBankAccounts(
  userId: string,
): Promise<BankAccountResponse[]> {
  logger.info("Fetching user bank accounts", { userId });

  const accounts = await prismaPostgres.bankAccount.findMany({
    where: {
      userId,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return accounts.map((account) => ({
    accountId: account.id,
    accountNumber: account.accountNumber,
    bankName: account.bankName,
    accountHolder: account.accountHolder,
    email: account.email,
    phone: account.phone,
    balance: Currency.toRupees(account.balance),
    accountType: account.accountType,
    ifscCode: account.ifscCode,
    branch: account.branch,
    status: account.status,
    isFrozen: account.isFrozen,
    createdAt: account.createdAt,
  }));
}

export async function getBankAccountDetails(
  userId: string,
  accountId: string,
): Promise<BankAccountResponse> {
  logger.info("Fetching bank account details", { userId, accountId });

  const account = await prismaPostgres.bankAccount.findFirst({
    where: {
      id: accountId,
      userId, // Ensure user owns this account
    },
  });

  if (!account) {
    throw new ApiError(
      404,
      "ACCOUNT_NOT_FOUND",
      "Bank account not found or you don't have access to it.",
    );
  }

  return {
    accountId: account.id,
    accountNumber: account.accountNumber,
    bankName: account.bankName,
    accountHolder: account.accountHolder,
    email: account.email,
    phone: account.phone,
    balance: Currency.toRupees(account.balance),
    accountType: account.accountType,
    ifscCode: account.ifscCode,
    branch: account.branch,
    status: account.status,
    isFrozen: account.isFrozen,
    createdAt: account.createdAt,
    updatedAt: account.updatedAt,
  };
}
