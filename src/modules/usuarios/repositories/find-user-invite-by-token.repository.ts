import type { Prisma, PrismaClient } from "@prisma/client";

import { prisma } from "@/lib/prisma";

type DbClient = PrismaClient | Prisma.TransactionClient;

type FindUserInviteByTokenRepositoryInput = {
  token: string;
  availableOnly?: boolean;
};

export async function findUserInviteByTokenRepository(
  input: FindUserInviteByTokenRepositoryInput,
  dbClient?: DbClient,
) {
  const db = dbClient ?? prisma;

  if (input.availableOnly) {
    return db.userInvite.findFirst({
      where: {
        token: input.token,
        usedAt: null,
      },
    });
  }

  return db.userInvite.findUnique({
    where: { token: input.token },
  });
}
