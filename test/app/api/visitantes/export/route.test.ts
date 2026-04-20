import { beforeEach, describe, expect, it, vi } from "vitest"

import { GET } from "@/app/api/visitantes/export/route"

const requireAuthSessionForApiMock = vi.fn()
const exportVisitantesExcelServiceMock = vi.fn()

vi.mock("@/lib/require-auth-session", () => ({
  requireAuthSessionForApi: () => requireAuthSessionForApiMock()
}))

vi.mock("@/modules/visitantes/services/export-visitantes-excel.service", () => ({
  exportVisitantesExcelService: (input: unknown) => exportVisitantesExcelServiceMock(input)
}))

describe("/api/visitantes/export route", () => {
  beforeEach(() => {
    vi.clearAllMocks()

    requireAuthSessionForApiMock.mockResolvedValue({
      sub: "user-1",
      role: "STAFF",
      permissions: ["VISITANTES_EXPORTAR"],
      nome: "Usuario Teste",
      email: "usuario@teste.com"
    })
  })

  it("retorna 200 e arquivo xlsx quando usuario tem permissao", async () => {
    exportVisitantesExcelServiceMock.mockResolvedValueOnce({
      file: new ArrayBuffer(8),
      fileName: "visitantes-2026-04-20.xlsx",
      totalVisitantes: 2
    })

    const response = await GET(
      new Request(
        "http://localhost/api/visitantes/export?createdFrom=2026-04-01&createdTo=2026-04-20"
      )
    )

    expect(response.status).toBe(200)
    expect(response.headers.get("Content-Type")).toBe(
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    )
    expect(response.headers.get("Content-Disposition")).toContain("visitantes-2026-04-20.xlsx")
    expect(response.headers.get("X-Export-Total")).toBe("2")
    expect(exportVisitantesExcelServiceMock).toHaveBeenCalledWith({
      createdFrom: "2026-04-01",
      createdTo: "2026-04-20"
    })
  })

  it("retorna 403 quando usuario nao possui VISITANTES_EXPORTAR", async () => {
    requireAuthSessionForApiMock.mockResolvedValueOnce({
      sub: "user-1",
      role: "STAFF",
      permissions: ["VISITANTES_LISTAR"],
      nome: "Usuario Teste",
      email: "usuario@teste.com"
    })

    const response = await GET(new Request("http://localhost/api/visitantes/export"))
    const body = (await response.json()) as {
      success: boolean
      error: {
        code: string
      }
    }

    expect(response.status).toBe(403)
    expect(body.success).toBe(false)
    expect(body.error.code).toBe("FORBIDDEN")
    expect(exportVisitantesExcelServiceMock).not.toHaveBeenCalled()
  })
})
