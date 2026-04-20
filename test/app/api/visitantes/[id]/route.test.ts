import { beforeEach, describe, expect, it, vi } from "vitest"

import { GET, PUT, DELETE } from "@/app/api/visitantes/[id]/route"
import { AppError } from "@/shared/errors/app-error"
import { requireAuthSessionForApi } from "@/lib/require-auth-session"

const getVisitanteDetailServiceMock = vi.fn()
const updateVisitanteServiceMock = vi.fn()
const deleteVisitanteServiceMock = vi.fn()

vi.mock("@/lib/require-auth-session", () => ({
  requireAuthSessionForApi: vi.fn().mockResolvedValue({
    sub: "user-1",
    role: "STAFF",
    permissions: ["VISITANTES_LISTAR", "VISITANTES_EDITAR", "VISITANTES_EXCLUIR"],
    nome: "Usuario Teste",
    email: "usuario@teste.com"
  })
}))

vi.mock("@/modules/visitantes/services/get-visitante-detail.service", () => ({
  getVisitanteDetailService: (id: string) => getVisitanteDetailServiceMock(id)
}))

vi.mock("@/modules/visitantes/services/update-visitante.service", () => ({
  updateVisitanteService: (input: unknown) => updateVisitanteServiceMock(input)
}))

vi.mock("@/modules/visitantes/services/delete-visitante.service", () => ({
  deleteVisitanteService: (id: string) => deleteVisitanteServiceMock(id)
}))

describe("/api/visitantes/[id] route", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(requireAuthSessionForApi).mockResolvedValue({
      sub: "user-1",
      role: "STAFF",
      permissions: ["VISITANTES_LISTAR", "VISITANTES_EDITAR", "VISITANTES_EXCLUIR"],
      nome: "Usuario Teste",
      email: "usuario@teste.com"
    })
  })

  it("GET retorna detalhe", async () => {
    getVisitanteDetailServiceMock.mockResolvedValueOnce({ member: { id: "member-1" } })

    const response = await GET(new Request("http://localhost/api/visitantes/member-1"), {
      params: Promise.resolve({ id: "member-1" })
    })

    const body = (await response.json()) as { success: boolean }

    expect(response.status).toBe(200)
    expect(body.success).toBe(true)
  })

  it("PUT atualiza visitante", async () => {
    updateVisitanteServiceMock.mockResolvedValueOnce({ id: "member-1" })

    const request = new Request("http://localhost/api/visitantes/member-1", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Visitante Atualizado",
        birthDate: "1990-01-01",
        baptized: false,
        actualChurch: "NONE",
        howKnow: "EVENT",
        familyOperations: []
      })
    })

    const response = await PUT(request, {
      params: Promise.resolve({ id: "member-1" })
    })

    const body = (await response.json()) as { success: boolean }

    expect(response.status).toBe(200)
    expect(body.success).toBe(true)
  })

  describe("DELETE /api/visitantes/[id]", () => {
    it("exclui visitante e retorna 200", async () => {
      deleteVisitanteServiceMock.mockResolvedValueOnce({ success: true })

      const response = await DELETE(new Request("http://localhost/api/visitantes/member-1"), {
        params: Promise.resolve({ id: "member-1" })
      })

      const body = (await response.json()) as { success: boolean }

      expect(response.status).toBe(200)
      expect(body.success).toBe(true)
      expect(deleteVisitanteServiceMock).toHaveBeenCalledWith("member-1")
    })

    it("retorna 403 sem permissao VISITANTES_EXCLUIR", async () => {
      vi.mocked(requireAuthSessionForApi).mockResolvedValueOnce({
        sub: "user-1",
        role: "STAFF",
        permissions: ["VISITANTES_LISTAR"],
        nome: "Usuario Teste",
        email: "usuario@teste.com"
      })

      const response = await DELETE(new Request("http://localhost/api/visitantes/member-1"), {
        params: Promise.resolve({ id: "member-1" })
      })

      expect(response.status).toBe(403)
      expect(deleteVisitanteServiceMock).not.toHaveBeenCalled()
    })

    it("retorna 404 quando visitante nao encontrado", async () => {
      deleteVisitanteServiceMock.mockRejectedValueOnce(
        new AppError("Visitante nao encontrado", 404, "VISITANTE_NOT_FOUND")
      )

      const response = await DELETE(new Request("http://localhost/api/visitantes/id-inexistente"), {
        params: Promise.resolve({ id: "id-inexistente" })
      })

      expect(response.status).toBe(404)
    })
  })
})
