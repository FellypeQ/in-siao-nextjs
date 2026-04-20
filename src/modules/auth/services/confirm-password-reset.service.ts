import { hash } from "bcryptjs"

import { deleteUserPasswordResetTokensRepository } from "@/modules/auth/repositories/delete-user-password-reset-tokens.repository"
import { findPasswordResetTokenRepository } from "@/modules/auth/repositories/find-password-reset-token.repository"
import { updateUserPasswordRepository } from "@/modules/auth/repositories/update-user-password.repository"
import { AppError } from "@/shared/errors/app-error"

export async function confirmPasswordResetService(token: string, password: string): Promise<void> {
  const resetToken = await findPasswordResetTokenRepository(token)

  if (!resetToken || resetToken.expiresAt < new Date()) {
    throw new AppError(
      "Link inválido ou expirado. Solicite um novo link de recuperação.",
      400,
      "INVALID_RESET_TOKEN"
    )
  }

  const passwordHash = await hash(password, 12)
  await updateUserPasswordRepository(resetToken.userId, passwordHash)
  await deleteUserPasswordResetTokensRepository(resetToken.userId)
}
