import { beforeEach, describe, expect, it, vi } from "vitest"

import { GET } from "@/app/api/visitantes/chart/route"
import { requireAuthSessionForApi } from "@/lib/require-auth-session"
import { AppError } from "@/shared/errors/app-error"

const getChartDataServiceMock = vi.fn()

vi.mock("@/lib/require-auth-session", () => ({
  requireAuthSessionForApi: vi.fn().mockResolvedValue({
    sub: "user-1",
    role: "STAFF",
    permissions: ["VISITANTES_CADASTRAR"],
    nome: "Usuario Teste",
    email: "usuario@teste.com",
  }),
}))

vi.mock("@/modules/visitantes/services/get-visitantes-chart-data.service", () => ({
  getVisitantesChartDataService: () => getChartDataServiceMock(),
}))

describe("GET /api/visitantes/chart", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(requireAuthSessionForApi).mockResolvedValue({
      sub: "user-1",
      role: "STAFF",
      permissions: ["VISITANTES_CADASTRAR"],
      nome: "Usuario Teste",
      email: "usuario@teste.com",
      iat: 0,
      exp: 9999999999,
    })
  })

  it("retorna 200 com dados do gráfico para qualquer usuário autenticado", async () => {
    const mockData = [
      { date: "2026-03-22", count: 5 },
      { date: "2026-03-23", count: 3 },
    ]
    getChartDataServiceMock.mockResolvedValueOnce(mockData)

    const response = await GET()
    const body = (await response.json()) as unknown[]

    expect(response.status).toBe(200)
    expect(body).toEqual(mockData)
  })

  it("retorna 200 mesmo sem permissão VISITANTES_LISTAR", async () => {
    getChartDataServiceMock.mockResolvedValueOnce([])

    const response = await GET()

    expect(response.status).toBe(200)
  })

  it("retorna 401 quando não há sessão", async () => {
    vi.mocked(requireAuthSessionForApi).mockRejectedValueOnce(
      new AppError("Nao autenticado", 401, "UNAUTHORIZED"),
    )

    const response = await GET()

    expect(response.status).toBe(401)
  })
})
