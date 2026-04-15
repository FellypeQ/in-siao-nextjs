import type { Prisma, PrismaClient } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import type { UserInviteRole } from "@/modules/usuarios/types/user-invite.type";

type DbClient = PrismaClient | Prisma.TransactionClient;

type CreateUserInviteRepositoryInput = {
  token: string;
  role: UserInviteRole;
  createdById: string;
};

export async function createUserInviteRepository(
  input: CreateUserInviteRepositoryInput,
  dbClient?: DbClient,
) {
  const db = dbClient ?? prisma;

  return db.userInvite.create({
    data: {
      token: input.token,
      role: input.role,
      createdById: input.createdById,
    },
  });
}
