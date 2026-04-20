import { prisma } from "@/lib/prisma"

export async function findPasswordResetTokenRepository(token: string) {
  return prisma.passwordResetToken.findUnique({
    where: { token }
  })
}
