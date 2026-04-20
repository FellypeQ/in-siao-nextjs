import { beforeEach, describe, expect, it, vi } from "vitest"

import { GET, POST } from "@/app/api/mensagens/route"
import { requireAuthSessionForApi } from "@/lib/require-auth-session"

const listMessageTemplatesServiceMock = vi.fn()
const createMessageTemplateServiceMock = vi.fn()

vi.mock("@/lib/require-auth-session", () => ({
  requireAuthSessionForApi: vi.fn().mockResolvedValue({
    sub: "user-1",
    role: "STAFF",
    permissions: ["MENSAGENS_GERENCIAR"],
    nome: "Usuario",
    email: "user@test.com"
  })
}))

vi.mock("@/modules/mensagens/services/list-message-templates.service", () => ({
  listMessageTemplatesService: () => listMessageTemplatesServiceMock()
}))

vi.mock("@/modules/mensagens/services/create-message-template.service", () => ({
  createMessageTemplateService: (data: unknown) => createMessageTemplateServiceMock(data)
}))

describe("/api/mensagens route", () => {
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

  it("GET retorna templates ativos", async () => {
    listMessageTemplatesServiceMock.mockResolvedValueOnce([{ id: "tpl-1" }])

    const response = await GET()
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body).toEqual([{ id: "tpl-1" }])
  })

  it("POST retorna 201 em payload valido", async () => {
    createMessageTemplateServiceMock.mockResolvedValueOnce({ id: "tpl-1" })

    const request = new Request("http://localhost/api/mensagens", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: "T1", body: "Ola" })
    })

    const response = await POST(request)

    expect(response.status).toBe(201)
    expect(createMessageTemplateServiceMock).toHaveBeenCalledWith({ title: "T1", body: "Ola" })
  })

  it("POST retorna 400 em payload invalido", async () => {
    const request = new Request("http://localhost/api/mensagens", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: "", body: "" })
    })

    const response = await POST(request)

    expect(response.status).toBe(400)
  })

  it("GET retorna 403 sem permissao", async () => {
    vi.mocked(requireAuthSessionForApi).mockResolvedValueOnce({
      sub: "user-1",
      role: "STAFF",
      permissions: ["VISITANTES_LISTAR"],
      nome: "Usuario",
      email: "user@test.com",
      iat: 0,
      exp: 0
    })

    const response = await GET()

    expect(response.status).toBe(403)
  })
})
