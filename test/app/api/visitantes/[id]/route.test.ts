import { beforeEach, describe, expect, it, vi } from "vitest"

import { GET, PUT } from "@/app/api/visitantes/[id]/route"

const getVisitanteDetailServiceMock = vi.fn()
const updateVisitanteServiceMock = vi.fn()

vi.mock("@/modules/visitantes/services/get-visitante-detail.service", () => ({
  getVisitanteDetailService: (id: string) => getVisitanteDetailServiceMock(id)
}))

vi.mock("@/modules/visitantes/services/update-visitante.service", () => ({
  updateVisitanteService: (input: unknown) => updateVisitanteServiceMock(input)
}))

describe("/api/visitantes/[id] route", () => {
  beforeEach(() => {
    vi.clearAllMocks()
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
})
