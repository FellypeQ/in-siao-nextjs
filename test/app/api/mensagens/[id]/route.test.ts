import { beforeEach, describe, expect, it, vi } from "vitest"

import { DELETE, PUT } from "@/app/api/mensagens/[id]/route"
import { requireAuthSessionForApi } from "@/lib/require-auth-session"

const updateMessageTemplateServiceMock = vi.fn()
const deleteMessageTemplateServiceMock = vi.fn()

vi.mock("@/lib/require-auth-session", () => ({
  requireAuthSessionForApi: vi.fn().mockResolvedValue({
    sub: "user-1",
    role: "STAFF",
    permissions: ["MENSAGENS_GERENCIAR"],
    nome: "Usuario",
    email: "user@test.com"
  })
}))

vi.mock("@/modules/mensagens/services/update-message-template.service", () => ({
  updateMessageTemplateService: (data: unknown) => updateMessageTemplateServiceMock(data)
}))

vi.mock("@/modules/mensagens/services/delete-message-template.service", () => ({
  deleteMessageTemplateService: (id: string) => deleteMessageTemplateServiceMock(id)
}))

describe("/api/mensagens/[id] route", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(requireAuthSessionForApi).mockResolvedValue({
      sub: "user-1",
      role: "STAFF",
      permissions: ["MENSAGENS_GERENCIAR"],
      nome: "Usuario",
      email: "user@test.com",
      iat: 0,
      exp: 0
    })
  })

  it("PUT atualiza template", async () => {
    updateMessageTemplateServiceMock.mockResolvedValueOnce({ id: "tpl-1", title: "Novo" })

    const request = new Request("http://localhost/api/mensagens/tpl-1", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: "Novo", body: "Corpo", order: 2 })
    })

    const response = await PUT(request, { params: Promise.resolve({ id: "tpl-1" }) })

    expect(response.status).toBe(200)
    expect(updateMessageTemplateServiceMock).toHaveBeenCalledWith({
      id: "tpl-1",
      title: "Novo",
      body: "Corpo",
      order: 2
    })
  })

  it("PUT retorna 400 quando payload e invalido", async () => {
    const request = new Request("http://localhost/api/mensagens/tpl-1", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ order: 0 })
    })

    const response = await PUT(request, { params: Promise.resolve({ id: "tpl-1" }) })

    expect(response.status).toBe(400)
  })

  it("DELETE retorna resultado soft/hard", async () => {
    deleteMessageTemplateServiceMock.mockResolvedValueOnce({ deleted: "soft" })

    const response = await DELETE(new Request("http://localhost/api/mensagens/tpl-1"), {
      params: Promise.resolve({ id: "tpl-1" })
    })

    expect(response.status).toBe(200)
    expect(await response.json()).toEqual({ deleted: "soft" })
  })

  it("DELETE retorna 403 sem permissao", async () => {
    vi.mocked(requireAuthSessionForApi).mockResolvedValueOnce({
      sub: "user-1",
      role: "STAFF",
      permissions: ["MENSAGENS_ENVIAR"],
      nome: "Usuario",
      email: "user@test.com",
      iat: 0,
      exp: 0
    })

    const response = await DELETE(new Request("http://localhost/api/mensagens/tpl-1"), {
      params: Promise.resolve({ id: "tpl-1" })
    })

    expect(response.status).toBe(403)
  })
})
