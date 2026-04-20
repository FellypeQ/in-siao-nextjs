import { beforeEach, describe, expect, it, vi } from "vitest"

import { logMensagemVisitanteService } from "@/modules/visitantes/services/log-mensagem-visitante.service"
import { AppError } from "@/shared/errors/app-error"

const findVisitanteByIdRepositoryMock = vi.fn()
const getVisitanteMensagensRepositoryMock = vi.fn()
const createMemberMessageLogRepositoryMock = vi.fn()
const findMessageTemplateByIdRepositoryMock = vi.fn()

vi.mock("@/modules/visitantes/repositories/find-visitante-by-id.repository", () => ({
  findVisitanteByIdRepository: (id: string) => findVisitanteByIdRepositoryMock(id)
}))

vi.mock("@/modules/visitantes/repositories/get-visitante-mensagens.repository", () => ({
  getVisitanteMensagensRepository: (id: string) => getVisitanteMensagensRepositoryMock(id)
}))

vi.mock("@/modules/visitantes/repositories/log-mensagem-visitante.repository", () => ({
  createMemberMessageLogRepository: (data: unknown) => createMemberMessageLogRepositoryMock(data)
}))

vi.mock("@/modules/mensagens/repositories/update-message-template.repository", () => ({
  findMessageTemplateByIdRepository: (id: string) => findMessageTemplateByIdRepositoryMock(id)
}))

describe("logMensagemVisitanteService", () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  it("cria log com snapshot processado quando template e a proxima mensagem", async () => {
    findVisitanteByIdRepositoryMock.mockResolvedValueOnce({ id: "member-1", name: "Maria Silva" })
    findMessageTemplateByIdRepositoryMock.mockResolvedValueOnce({
      id: "tpl-1",
      title: "Boas-vindas",
      body: "Ola {nome_do_visitante}!",
      deletedAt: null
    })
    getVisitanteMensagensRepositoryMock.mockResolvedValueOnce({
      templates: [{ id: "tpl-1", title: "Boas-vindas", body: "Ola {nome_do_visitante}!", order: 1 }],
      logs: []
    })
    createMemberMessageLogRepositoryMock.mockResolvedValueOnce({ id: "log-1" })

    await logMensagemVisitanteService("member-1", "tpl-1", "user-1")

    expect(createMemberMessageLogRepositoryMock).toHaveBeenCalledWith({
      memberId: "member-1",
      messageTemplateId: "tpl-1",
      messageTitle: "Boas-vindas",
      messageBody: "Ola Maria!",
      sentByUserId: "user-1"
    })
  })

  it("lanca erro quando tenta enviar template fora da ordem", async () => {
    findVisitanteByIdRepositoryMock.mockResolvedValueOnce({ id: "member-1", name: "Maria Silva" })
    findMessageTemplateByIdRepositoryMock.mockResolvedValueOnce({
      id: "tpl-2",
      title: "Mensagem 2",
      body: "Texto",
      deletedAt: null
    })
    getVisitanteMensagensRepositoryMock.mockResolvedValueOnce({
      templates: [
        { id: "tpl-1", title: "Mensagem 1", body: "A", order: 1 },
        { id: "tpl-2", title: "Mensagem 2", body: "B", order: 2 }
      ],
      logs: []
    })

    await expect(logMensagemVisitanteService("member-1", "tpl-2", "user-1")).rejects.toBeInstanceOf(AppError)
  })

  it("lanca erro quando mensagem ja foi enviada", async () => {
    findVisitanteByIdRepositoryMock.mockResolvedValueOnce({ id: "member-1", name: "Maria Silva" })
    findMessageTemplateByIdRepositoryMock.mockResolvedValueOnce({
      id: "tpl-1",
      title: "Mensagem 1",
      body: "A",
      deletedAt: null
    })
    getVisitanteMensagensRepositoryMock.mockResolvedValueOnce({
      templates: [{ id: "tpl-1", title: "Mensagem 1", body: "A", order: 1 }],
      logs: [{ id: "log-1", messageTemplateId: "tpl-1" }]
    })

    await expect(logMensagemVisitanteService("member-1", "tpl-1", "user-1")).rejects.toBeInstanceOf(AppError)
  })
})
