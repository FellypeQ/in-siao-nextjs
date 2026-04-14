import { beforeEach, describe, expect, it, vi } from "vitest"

import { GET, POST } from "@/app/api/visitantes/route"

const createVisitanteServiceMock = vi.fn()
const listVisitantesServiceMock = vi.fn()

vi.mock("@/modules/visitantes/services/create-visitante.service", () => ({
  createVisitanteService: (input: unknown) => createVisitanteServiceMock(input)
}))

vi.mock("@/modules/visitantes/services/list-visitantes.service", () => ({
  listVisitantesService: (input: unknown) => listVisitantesServiceMock(input)
}))

describe("/api/visitantes route", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("POST retorna 201 em payload valido", async () => {
    createVisitanteServiceMock.mockResolvedValueOnce({ id: "member-1" })

    const request = new Request("http://localhost/api/visitantes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Visitante Teste",
        birthDate: "1990-01-01",
        baptized: false,
        actualChurch: "NONE",
        howKnow: "EVENT",
        familyMembers: []
      })
    })

    const response = await POST(request)
    const body = (await response.json()) as { success: boolean }

    expect(response.status).toBe(201)
    expect(body.success).toBe(true)
  })

  it("GET retorna listagem paginada", async () => {
    listVisitantesServiceMock.mockResolvedValueOnce({
      items: [],
      total: 0,
      page: 1,
      limit: 20,
      totalPages: 0
    })

    const response = await GET(
      new Request(
        "http://localhost/api/visitantes?page=1&limit=20&createdFrom=2026-04-01&createdTo=2026-04-14"
      )
    )
    const body = (await response.json()) as { success: boolean; items: unknown[] }

    expect(response.status).toBe(200)
    expect(body.success).toBe(true)
    expect(body.items).toEqual([])
    expect(listVisitantesServiceMock).toHaveBeenCalledWith({
      page: 1,
      limit: 20,
      createdFrom: "2026-04-01",
      createdTo: "2026-04-14"
    })
  })
})
