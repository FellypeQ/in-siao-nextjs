import { prisma } from "@/lib/prisma";

export async function findUsuarioByEmailRepository(email: string) {
  return prisma.user.findUnique({ where: { email } });
}
