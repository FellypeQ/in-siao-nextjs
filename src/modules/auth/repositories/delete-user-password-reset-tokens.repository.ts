import { prisma } from "@/lib/prisma"

export async function deleteUserPasswordResetTokensRepository(userId: string) {
  await prisma.passwordResetToken.deleteMany({
    where: { userId }
  })
}
