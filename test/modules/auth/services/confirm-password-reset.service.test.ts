import { beforeEach, describe, expect, it, vi } from "vitest"

import { confirmPasswordResetService } from "@/modules/auth/services/confirm-password-reset.service"
import { AppError } from "@/shared/errors/app-error"

vi.mock("@/modules/auth/repositories/find-password-reset-token.repository", () => ({
  findPasswordResetTokenRepository: vi.fn()
}))
vi.mock("@/modules/auth/repositories/update-user-password.repository", () => ({
  updateUserPasswordRepository: vi.fn()
}))
vi.mock("@/modules/auth/repositories/delete-user-password-reset-tokens.repository", () => ({
  deleteUserPasswordResetTokensRepository: vi.fn()
}))
vi.mock("bcryptjs", () => ({
  hash: vi.fn()
}))

import { hash as hashRaw } from "bcryptjs"
import { findPasswordResetTokenRepository } from "@/modules/auth/repositories/find-password-reset-token.repository"

// bcryptjs expõe overloads — forçar tipo do overload assíncrono para o mock funcionar
const hash = hashRaw as (password: string, salt: number | string) => Promise<string>
import { updateUserPasswordRepository } from "@/modules/auth/repositories/update-user-password.repository"
import { deleteUserPasswordResetTokensRepository } from "@/modules/auth/repositories/delete-user-password-reset-tokens.repository"

const validToken = {
  id: "token-id",
  userId: "user-1",
  token: "valid-token",
  expiresAt: new Date(Date.now() + 60 * 60 * 1000),
  createdAt: new Date()
}

describe("confirmPasswordResetService", () => {
  beforeEach(() => {
    vi.resetAllMocks()
    vi.mocked(hash).mockResolvedValue("hashed-password")
  })

  it("atualiza senha e deleta tokens em sucesso com token válido", async () => {
    vi.mocked(findPasswordResetTokenRepository).mockResolvedValue(validToken)

    await confirmPasswordResetService("valid-token", "Senha@123")

    expect(updateUserPasswordRepository).toHaveBeenCalledWith("user-1", "hashed-password")
    expect(deleteUserPasswordResetTokensRepository).toHaveBeenCalledWith("user-1")
  })

  it("lança AppError 400 quando token não encontrado", async () => {
    vi.mocked(findPasswordResetTokenRepository).mockResolvedValue(null)

    await expect(confirmPasswordResetService("inexistente", "Senha@123")).rejects.toThrow(AppError)
    await expect(confirmPasswordResetService("inexistente", "Senha@123")).rejects.toMatchObject({
      statusCode: 400,
      code: "INVALID_RESET_TOKEN"
    })
  })

  it("lança AppError 400 quando token está expirado", async () => {
    vi.mocked(findPasswordResetTokenRepository).mockResolvedValue({
      ...validToken,
      expiresAt: new Date(Date.now() - 1000)
    })

    await expect(confirmPasswordResetService("expired-token", "Senha@123")).rejects.toThrow(AppError)
    await expect(confirmPasswordResetService("expired-token", "Senha@123")).rejects.toMatchObject({
      statusCode: 400,
      code: "INVALID_RESET_TOKEN"
    })
  })

  it("não atualiza senha quando token é inválido", async () => {
    vi.mocked(findPasswordResetTokenRepository).mockResolvedValue(null)

    await expect(confirmPasswordResetService("bad-token", "Senha@123")).rejects.toThrow(AppError)

    expect(updateUserPasswordRepository).not.toHaveBeenCalled()
    expect(deleteUserPasswordResetTokensRepository).not.toHaveBeenCalled()
  })
})
