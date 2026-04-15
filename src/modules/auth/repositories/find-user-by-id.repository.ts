import { prisma } from "@/lib/prisma"

export async function findUserByIdRepository(id: string) {
  return prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      nome: true,
      email: true,
      role: true,
      deletedAt: true
    }
  })
}
