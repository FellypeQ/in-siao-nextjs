import { beforeEach, describe, expect, it, vi } from "vitest"

import { requestPasswordResetService } from "@/modules/auth/services/request-password-reset.service"

vi.mock("@/modules/auth/repositories/find-user-by-email.repository", () => ({
  findUserByEmailRepository: vi.fn()
}))
vi.mock("@/modules/auth/repositories/delete-user-password-reset-tokens.repository", () => ({
  deleteUserPasswordResetTokensRepository: vi.fn()
}))
vi.mock("@/modules/auth/repositories/create-password-reset-token.repository", () => ({
  createPasswordResetTokenRepository: vi.fn()
}))
vi.mock("@/modules/auth/jobs/send-password-reset-email.job", () => ({
  sendPasswordResetEmailJob: vi.fn()
}))

import { findUserByEmailRepository } from "@/modules/auth/repositories/find-user-by-email.repository"
import { deleteUserPasswordResetTokensRepository } from "@/modules/auth/repositories/delete-user-password-reset-tokens.repository"
import { createPasswordResetTokenRepository } from "@/modules/auth/repositories/create-password-reset-token.repository"
import { sendPasswordResetEmailJob } from "@/modules/auth/jobs/send-password-reset-email.job"

const mockUser = {
  id: "user-1",
  nome: "Teste",
  email: "teste@exemplo.com",
  passwordHash: "hash",
  role: "STAFF" as const,
  deletedAt: null,
  sobrenomeEncrypted: "enc",
  createdAt: new Date(),
  updatedAt: new Date()
}

describe("requestPasswordResetService", () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  it("retorna sem erro quando email não existe (não vaza existência)", async () => {
    vi.mocked(findUserByEmailRepository).mockResolvedValue(null)

    await expect(requestPasswordResetService({ email: "nao@existe.com" })).resolves.toBeUndefined()

    expect(deleteUserPasswordResetTokensRepository).not.toHaveBeenCalled()
    expect(createPasswordResetTokenRepository).not.toHaveBeenCalled()
    expect(sendPasswordResetEmailJob).not.toHaveBeenCalled()
  })

  it("retorna sem erro quando usuário está desativado (deletedAt preenchido)", async () => {
    vi.mocked(findUserByEmailRepository).mockResolvedValue({
      ...mockUser,
      deletedAt: new Date()
    })

    await expect(requestPasswordResetService({ email: mockUser.email })).resolves.toBeUndefined()

    expect(sendPasswordResetEmailJob).not.toHaveBeenCalled()
  })

  it("cria token e dispara email quando email existe e usuário está ativo", async () => {
    vi.mocked(findUserByEmailRepository).mockResolvedValue(mockUser)
    vi.mocked(createPasswordResetTokenRepository).mockResolvedValue({
      id: "token-id",
      userId: "user-1",
      token: "reset-token-uuid",
      expiresAt: new Date(),
      createdAt: new Date()
    })

    await requestPasswordResetService({ email: mockUser.email })

    expect(deleteUserPasswordResetTokensRepository).toHaveBeenCalledWith("user-1")
    expect(createPasswordResetTokenRepository).toHaveBeenCalledWith("user-1")
    expect(sendPasswordResetEmailJob).toHaveBeenCalledWith(mockUser.email, "reset-token-uuid")
  })

  it("invalida tokens anteriores antes de criar novo", async () => {
    vi.mocked(findUserByEmailRepository).mockResolvedValue(mockUser)
    vi.mocked(createPasswordResetTokenRepository).mockResolvedValue({
      id: "token-id",
      userId: "user-1",
      token: "new-token",
      expiresAt: new Date(),
      createdAt: new Date()
    })

    const callOrder: string[] = []
    vi.mocked(deleteUserPasswordResetTokensRepository).mockImplementation(async () => {
      callOrder.push("delete")
    })
    vi.mocked(createPasswordResetTokenRepository).mockImplementation(async () => {
      callOrder.push("create")
      return { id: "t", userId: "user-1", token: "new-token", expiresAt: new Date(), createdAt: new Date() }
    })

    await requestPasswordResetService({ email: mockUser.email })

    expect(callOrder).toEqual(["delete", "create"])
  })

  it("normaliza email para minúsculas antes de buscar", async () => {
    vi.mocked(findUserByEmailRepository).mockResolvedValue(null)

    await requestPasswordResetService({ email: "TESTE@EXEMPLO.COM" })

    expect(findUserByEmailRepository).toHaveBeenCalledWith("teste@exemplo.com")
  })
})
