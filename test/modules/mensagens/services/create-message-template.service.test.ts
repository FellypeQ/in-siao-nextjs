import { beforeEach, describe, expect, it, vi } from "vitest"

import { createMessageTemplateService } from "@/modules/mensagens/services/create-message-template.service"

const getMaxOrderRepositoryMock = vi.fn()
const createMessageTemplateRepositoryMock = vi.fn()

vi.mock("@/modules/mensagens/repositories/create-message-template.repository", () => ({
  getMaxOrderRepository: () => getMaxOrderRepositoryMock(),
  createMessageTemplateRepository: (data: unknown) => createMessageTemplateRepositoryMock(data)
}))

describe("createMessageTemplateService", () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  it("cria template com proxima ordem disponivel", async () => {
    getMaxOrderRepositoryMock.mockResolvedValueOnce(3)
    createMessageTemplateRepositoryMock.mockResolvedValueOnce({ id: "tpl-1", order: 4 })

    const result = await createMessageTemplateService({
      title: "Mensagem 1",
      body: "Ola"
    })

    expect(createMessageTemplateRepositoryMock).toHaveBeenCalledWith({
      title: "Mensagem 1",
      body: "Ola",
      order: 4
    })
    expect(result.order).toBe(4)
  })
})
