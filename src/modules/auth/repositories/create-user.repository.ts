import { prisma } from "@/lib/prisma";
import type { Prisma, PrismaClient } from "@prisma/client";

type DbClient = PrismaClient | Prisma.TransactionClient;

type CreateUserRepositoryInput = {
  nome: string;
  sobrenomeEncrypted: string;
  email: string;
  passwordHash: string;
  role?: "ADMIN" | "STAFF" | "MASTER";
};

export async function createUserRepository(
  input: CreateUserRepositoryInput,
  dbClient?: DbClient,
) {
  const db = dbClient ?? prisma;

  return db.user.create({
    data: {
      nome: input.nome,
      sobrenomeEncrypted: input.sobrenomeEncrypted,
      email: input.email,
      passwordHash: input.passwordHash,
      role: input.role,
    },
  });
}
