import * as XLSX from "xlsx"
import { beforeEach, describe, expect, it, vi } from "vitest"

import { exportVisitantesExcelService } from "@/modules/visitantes/services/export-visitantes-excel.service"

const listVisitantesForExportRepositoryMock = vi.fn()

vi.mock("@/modules/visitantes/repositories/list-visitantes-for-export.repository", () => ({
  listVisitantesForExportRepository: (input: unknown) => listVisitantesForExportRepositoryMock(input)
}))

describe("exportVisitantesExcelService", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("gera workbook com abas de visitantes e familiares", async () => {
    listVisitantesForExportRepositoryMock.mockResolvedValueOnce([
      {
        id: "visitor-1",
        name: "Maria Souza",
        birthDate: new Date("2002-03-14T00:00:00.000Z"),
        phone: "11999999999",
        document: null,
        baptized: true,
        createdAt: new Date("2026-04-01T10:00:00.000Z"),
        visitorProfile: {
          actualChurch: "NONE",
          howKnow: "EVENT",
          howKnowOtherAnswer: null
        },
        memberPrays: [
          {
            pray: {
              id: "pray-1",
              text: "Orar pela familia"
            }
          }
        ],
        principalRelations: [
          {
            id: "rel-1",
            relationshipType: "CHILD",
            relatedMember: {
              id: "member-2",
              name: "Pedro Souza",
              birthDate: new Date("2012-09-10T00:00:00.000Z"),
              phone: null
            }
          }
        ]
      }
    ])

    const result = await exportVisitantesExcelService({})
    const workbook = XLSX.read(result.file, { type: "array" })

    expect(result.fileName).toContain("visitantes-")
    expect(workbook.SheetNames).toEqual(["Visitantes", "Familiares"])

    const visitantesRows = XLSX.utils.sheet_to_json(workbook.Sheets.Visitantes, { header: 1 }) as string[][]
    const familiaresRows = XLSX.utils.sheet_to_json(workbook.Sheets.Familiares, { header: 1 }) as string[][]

    expect(visitantesRows[1]?.[1]).toBe("Maria Souza")
    expect(visitantesRows[1]?.[2]).toBe("14/03/2002")
    expect(visitantesRows[1]?.[6]).toBe("Nao frequento nenhuma")
    expect(visitantesRows[1]?.[7]).toBe("Evento")
    expect(familiaresRows[1]?.[5]).toBe("Pedro Souza")
    expect(familiaresRows[1]?.[3]).toBe("Filho(a)")
    expect(familiaresRows[1]?.[6]).toBe("10/09/2012")
  })
})
