import { prisma } from "@/lib/prisma"

export async function findUserByEmailRepository(email: string) {
  return prisma.user.findUnique({ where: { email } })
}
