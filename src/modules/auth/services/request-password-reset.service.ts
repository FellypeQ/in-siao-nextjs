import { sendPasswordResetEmailJob } from "@/modules/auth/jobs/send-password-reset-email.job"
import { createPasswordResetTokenRepository } from "@/modules/auth/repositories/create-password-reset-token.repository"
import { deleteUserPasswordResetTokensRepository } from "@/modules/auth/repositories/delete-user-password-reset-tokens.repository"
import { findUserByEmailRepository } from "@/modules/auth/repositories/find-user-by-email.repository"
import type { RequestPasswordResetInput } from "@/modules/auth/schemas/request-password-reset.schema"

export async function requestPasswordResetService(input: RequestPasswordResetInput): Promise<void> {
  const email = input.email.trim().toLowerCase()
  const user = await findUserByEmailRepository(email)

  // Retorna silenciosamente se o usuário não existe ou foi desativado (não vazar existência)
  if (!user || user.deletedAt) return

  await deleteUserPasswordResetTokensRepository(user.id)
  const { token } = await createPasswordResetTokenRepository(user.id)
  await sendPasswordResetEmailJob(email, token)
}
