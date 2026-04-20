import { prisma } from "@/lib/prisma"

const DEFAULT_EXPIRY_MINUTES = 60

export async function createPasswordResetTokenRepository(userId: string) {
  const expiryMinutes = parseInt(
    process.env.PASSWORD_RESET_TOKEN_EXPIRY_MINUTES ?? String(DEFAULT_EXPIRY_MINUTES),
    10
  )
  const token = crypto.randomUUID()
  const expiresAt = new Date(Date.now() + expiryMinutes * 60 * 1000)

  return prisma.passwordResetToken.create({
    data: { userId, token, expiresAt }
  })
}
