import { beforeEach, describe, expect, it, vi } from "vitest"

import { deleteMessageTemplateService } from "@/modules/mensagens/services/delete-message-template.service"
import { AppError } from "@/shared/errors/app-error"

const findMessageTemplateByIdRepositoryMock = vi.fn()
const countLogsForTemplateRepositoryMock = vi.fn()
const softDeleteMessageTemplateRepositoryMock = vi.fn()
const hardDeleteMessageTemplateRepositoryMock = vi.fn()

vi.mock("@/modules/mensagens/repositories/update-message-template.repository", () => ({
  findMessageTemplateByIdRepository: (id: string) => findMessageTemplateByIdRepositoryMock(id)
}))

vi.mock("@/modules/mensagens/repositories/delete-message-template.repository", () => ({
  countLogsForTemplateRepository: (id: string) => countLogsForTemplateRepositoryMock(id),
  softDeleteMessageTemplateRepository: (id: string) => softDeleteMessageTemplateRepositoryMock(id),
  hardDeleteMessageTemplateRepository: (id: string) => hardDeleteMessageTemplateRepositoryMock(id)
}))

describe("deleteMessageTemplateService", () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  it("faz hard delete quando nao ha logs", async () => {
    findMessageTemplateByIdRepositoryMock.mockResolvedValueOnce({ id: "tpl-1" })
    countLogsForTemplateRepositoryMock.mockResolvedValueOnce(0)

    const result = await deleteMessageTemplateService("tpl-1")

    expect(hardDeleteMessageTemplateRepositoryMock).toHaveBeenCalledWith("tpl-1")
    expect(softDeleteMessageTemplateRepositoryMock).not.toHaveBeenCalled()
    expect(result).toEqual({ deleted: "hard" })
  })

  it("faz soft delete quando ja possui logs", async () => {
    findMessageTemplateByIdRepositoryMock.mockResolvedValueOnce({ id: "tpl-2" })
    countLogsForTemplateRepositoryMock.mockResolvedValueOnce(2)

    const result = await deleteMessageTemplateService("tpl-2")

    expect(softDeleteMessageTemplateRepositoryMock).toHaveBeenCalledWith("tpl-2")
    expect(hardDeleteMessageTemplateRepositoryMock).not.toHaveBeenCalled()
    expect(result).toEqual({ deleted: "soft" })
  })

  it("lanca erro quando template nao existe", async () => {
    findMessageTemplateByIdRepositoryMock.mockResolvedValueOnce(null)

    await expect(deleteMessageTemplateService("tpl-x")).rejects.toBeInstanceOf(AppError)
  })
})
