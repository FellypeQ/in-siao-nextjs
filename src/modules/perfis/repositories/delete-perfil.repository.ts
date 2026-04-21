import { prisma } from "@/lib/prisma";

export async function deletePerfilRepository(id: string) {
  return prisma.userProfile.delete({ where: { id } });
}
