import { prismaPostgres } from "@repo/db-postgres";

export const ledgerRepository = {
  findMany: (params: {
    where: any;
    take: number;
    skip: number;
  }) =>
    prismaPostgres.ledgerEntry.findMany({
      where: params.where,
      include: {
        relatedUser: {
          select: {
            id: true,
            fullName: true,
            email: true,
            phone: true,
          },
        },
        merchant: {
          select: {
            id: true,
            businessName: true,
            businessType: true,
          },
        },
      },
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      take: params.take,
      skip: params.skip,
    }),

  count: (where: any) =>
    prismaPostgres.ledgerEntry.count({
      where,
    }),

  findOneById: (userId: string, entryId: string) =>
    prismaPostgres.ledgerEntry.findFirst({
      where: {
        id: entryId,
        userId,
      },
      include: {
        relatedUser: {
          select: {
            id: true,
            fullName: true,
            email: true,
            phone: true,
          },
        },
        merchant: {
          select: {
            id: true,
            businessName: true,
            businessType: true,
            businessCategory: true,
          },
        },
      },
    }),

  markRequestPaidAsSuccess: (entryIds: string[]) =>
    prismaPostgres.ledgerEntry.updateMany({
      where: {
        id: { in: entryIds },
        entryType: "PAYMENT_REQUEST_PAID",
        status: "PENDING",
      },
      data: {
        status: "SUCCESS",
      },
    }),
};

