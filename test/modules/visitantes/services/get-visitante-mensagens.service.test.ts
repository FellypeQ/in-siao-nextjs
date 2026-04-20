import { beforeEach, describe, expect, it, vi } from "vitest"

import { getVisitanteMensagensService } from "@/modules/visitantes/services/get-visitante-mensagens.service"
import { AppError } from "@/shared/errors/app-error"

const findVisitanteByIdRepositoryMock = vi.fn()
const getVisitanteMensagensRepositoryMock = vi.fn()

vi.mock("@/modules/visitantes/repositories/find-visitante-by-id.repository", () => ({
  findVisitanteByIdRepository: (id: string) => findVisitanteByIdRepositoryMock(id)
}))

vi.mock("@/modules/visitantes/repositories/get-visitante-mensagens.repository", () => ({
  getVisitanteMensagensRepository: (id: string) => getVisitanteMensagensRepositoryMock(id)
}))

describe("getVisitanteMensagensService", () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  it("retorna templates, logs e proxima mensagem processada", async () => {
    findVisitanteByIdRepositoryMock.mockResolvedValueOnce({ id: "member-1", name: "Maria Silva" })
    getVisitanteMensagensRepositoryMock.mockResolvedValueOnce({
      templates: [
        { id: "tpl-1", title: "T1", body: "Ola {nome_do_visitante}", order: 1 },
        { id: "tpl-2", title: "T2", body: "Tudo bem?", order: 2 }
      ],
      logs: [{ id: "log-1", messageTemplateId: "tpl-1", messageTitle: "T1", sentAt: new Date() }]
    })

    const result = await getVisitanteMensagensService("member-1")

    expect(result.templates).toHaveLength(2)
    expect(result.sentLogs).toHaveLength(1)
    expect(result.nextTemplate).toEqual({
      id: "tpl-2",
      title: "T2",
      processedBody: "Tudo bem?"
    })
  })

  it("lanca erro quando visitante nao existe", async () => {
    findVisitanteByIdRepositoryMock.mockResolvedValueOnce(null)

    await expect(getVisitanteMensagensService("member-x")).rejects.toBeInstanceOf(AppError)
  })
})
