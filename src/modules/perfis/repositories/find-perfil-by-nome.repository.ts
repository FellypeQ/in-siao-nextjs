import { prisma } from "@/lib/prisma";

export async function findPerfilByNomeRepository(nome: string) {
  return prisma.userProfile.findUnique({ where: { nome } });
}
