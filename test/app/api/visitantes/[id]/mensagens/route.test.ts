import { beforeEach, describe, expect, it, vi } from "vitest"

import { GET, POST } from "@/app/api/visitantes/[id]/mensagens/route"
import { requireAuthSessionForApi } from "@/lib/require-auth-session"

const getVisitanteMensagensServiceMock = vi.fn()
const logMensagemVisitanteServiceMock = vi.fn()

vi.mock("@/lib/require-auth-session", () => ({
  requireAuthSessionForApi: vi.fn().mockResolvedValue({
    sub: "user-1",
    role: "STAFF",
    permissions: ["MENSAGENS_ENVIAR"],
    nome: "Usuario",
    email: "user@test.com"
  })
}))

vi.mock("@/modules/visitantes/services/get-visitante-mensagens.service", () => ({
  getVisitanteMensagensService: (id: string) => getVisitanteMensagensServiceMock(id)
}))

vi.mock("@/modules/visitantes/services/log-mensagem-visitante.service", () => ({
  logMensagemVisitanteService: (memberId: string, messageTemplateId: string, sentByUserId: string) =>
    logMensagemVisitanteServiceMock(memberId, messageTemplateId, sentByUserId)
}))

describe("/api/visitantes/[id]/mensagens route", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(requireAuthSessionForApi).mockResolvedValue({
      sub: "user-1",
      role: "STAFF",
      permissions: ["MENSAGENS_ENVIAR"],
      nome: "Usuario",
      email: "user@test.com",
      iat: 0,
      exp: 0
    })
  })

  it("GET retorna dados de stepper", async () => {
    getVisitanteMensagensServiceMock.mockResolvedValueOnce({
      templates: [],
      sentLogs: [],
      nextTemplate: null
    })

    const response = await GET(new Request("http://localhost/api/visitantes/member-1/mensagens"), {
      params: Promise.resolve({ id: "member-1" })
    })

    expect(response.status).toBe(200)
    expect(await response.json()).toEqual({ templates: [], sentLogs: [], nextTemplate: null })
  })

  it("POST registra log e retorna 201", async () => {
    logMensagemVisitanteServiceMock.mockResolvedValueOnce({ id: "log-1" })

    const request = new Request("http://localhost/api/visitantes/member-1/mensagens", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messageTemplateId: "tpl-1" })
    })

    const response = await POST(request, { params: Promise.resolve({ id: "member-1" }) })

    expect(response.status).toBe(201)
    expect(logMensagemVisitanteServiceMock).toHaveBeenCalledWith("member-1", "tpl-1", "user-1")
  })

  it("POST retorna 400 para payload invalido", async () => {
    const request = new Request("http://localhost/api/visitantes/member-1/mensagens", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messageTemplateId: "" })
    })

    const response = await POST(request, { params: Promise.resolve({ id: "member-1" }) })

    expect(response.status).toBe(400)
  })

  it("GET retorna 403 sem permissao de mensagens", async () => {
    vi.mocked(requireAuthSessionForApi).mockResolvedValueOnce({
      sub: "user-1",
      role: "STAFF",
      permissions: ["VISITANTES_LISTAR"],
      nome: "Usuario",
      email: "user@test.com",
      iat: 0,
      exp: 0
    })

    const response = await GET(new Request("http://localhost/api/visitantes/member-1/mensagens"), {
      params: Promise.resolve({ id: "member-1" })
    })

    expect(response.status).toBe(403)
  })
})
