import type { Prisma, PrismaClient } from "@prisma/client";

import { prisma } from "@/lib/prisma";

type DbClient = PrismaClient | Prisma.TransactionClient;

type UseUserInviteRepositoryInput = {
  token: string;
  usedById: string;
  usedAt?: Date;
};

export async function useUserInviteRepository(
  input: UseUserInviteRepositoryInput,
  dbClient?: DbClient,
) {
  const db = dbClient ?? prisma;
  const usedAt = input.usedAt ?? new Date();

  const result = await db.userInvite.updateMany({
    where: {
      token: input.token,
      usedAt: null,
    },
    data: {
      usedAt,
      usedById: input.usedById,
    },
  });

  return result.count;
}
