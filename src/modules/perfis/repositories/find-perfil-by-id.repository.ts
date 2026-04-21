import { prisma } from "@/lib/prisma";

export async function findPerfilByIdRepository(id: string) {
  return prisma.userProfile.findUnique({ where: { id } });
}
