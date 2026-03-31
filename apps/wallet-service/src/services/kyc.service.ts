import { prismaPostgres } from "@repo/db-postgres";
import { ApiError, Logger } from "@repo/libs";
import { invalidateWalletReadCaches } from "@repo/redis";
import { ActivateWalletInput } from "@repo/zod-schema";
import { nanoid } from "nanoid";

const logger = new Logger("kyc.service");

export const submitKyc = async (userId: string, data: ActivateWalletInput) => {
  const existingKyc = await prismaPostgres.kycProfile.findUnique({
    where: { userId },
  });

  if (existingKyc) {
    throw new ApiError(400, "KYC_ALREADY_SUBMITTED", "KYC already submitted");
  }

  if (data.idNumber) {
    const existingId = await prismaPostgres.kycProfile.findFirst({
      where: {
        idType: data.idType,
        idNumber: data.idNumber,
      },
    });

    if (existingId) {
      throw new ApiError(
        400,
        "ID_ALREADY_USED",
        `This ${data.idType} number is already registered with another account.`,
      );
    }
  }

  const wallet = await prismaPostgres.wallet.findUnique({
    where: { userId },
    select: { id: true, status: true },
  });

  if (!wallet) {
    throw new ApiError(
      400,
      "INVALID_WALLET_STATUS",
      "Wallet is not in PENDING_KYC status",
    );
  }

  await prismaPostgres.$transaction(async (tx) => {
    await tx.kycProfile.create({
      data: {
        id: `kyc_${nanoid(21)}`,
        userId,
        walletId: wallet.id,
        fullName: data.fullName,
        dob: new Date(data.dob), // Convert string YYYY-MM-DD to Date object
        address: data.address, // Stores the object { line1, city... } directly as JSON

        // Identity Data
        idType: data.idType,
        idNumber: data.idNumber ?? null, // Handle optional

        // Image URLs (Mapping frontend names to DB columns)
        idFrontUrl: data.idFrontUrl ?? null,
        idBackUrl: data.idBackUrl ?? null,
        selfieUrl: data.selfieUrl ?? null,

        status: "APPROVED", // Auto-approving for this flow
        verifiedAt: new Date(),
      },
    });

    await tx.wallet.update({
      where: { id: wallet.id },
      data: { status: "ACTIVE", isFrozen: false, version: { increment: 1 } },
    });
  });

  await invalidateWalletReadCaches([userId]);

  logger.info(
    "KYC Submited and Wallet status is pending waithing to approval",
    { userId },
  );

  return {
    kycStatus: "APPROVED",
    walletStatus: "ACTIVE",
    message: "KYC approved. Your wallet is now active!",
  };
};
