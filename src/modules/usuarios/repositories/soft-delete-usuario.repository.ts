import { prisma } from "@/lib/prisma";

export async function softDeleteUsuarioRepository(id: string) {
  return prisma.user.update({
    where: { id },
    data: { deletedAt: new Date() },
  });
}
