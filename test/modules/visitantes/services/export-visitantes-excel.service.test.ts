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

  it("mantem abas existentes e adiciona Todos os visitantes sem IDs", async () => {
    listVisitantesForExportRepositoryMock.mockResolvedValueOnce([
      {
        id: "visitor-1",
        name: "Maria Souza",
        birthDate: new Date("2002-03-14T00:00:00.000Z"),
        phone: "11999999999",
        type: "VISITOR",
        createdAt: new Date("2026-04-01T10:00:00.000Z"),
        visitorProfile: {
          actualChurch: "NONE",
          howKnow: "EVENT"
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
            relationshipType: "CHILD",
            relatedMember: {
              name: "Pedro Souza",
              birthDate: new Date("2012-09-10T00:00:00.000Z"),
              phone: "21988887777",
              type: "REGULAR_ATTENDEE",
              createdAt: new Date("2026-03-01T10:00:00.000Z")
            }
          }
        ]
      }
    ])

    const result = await exportVisitantesExcelService({})
    const workbook = XLSX.read(result.file, { type: "array" })

    expect(result.fileName).toContain("visitantes-")
    expect(workbook.SheetNames).toEqual(["Visitantes", "Familiares", "Todos os visitantes"])
    expect(workbook.Sheets["Todos os visitantes"]?.["!autofilter"]).toBeTruthy()

    const visitantesRows = XLSX.utils.sheet_to_json(workbook.Sheets.Visitantes, {
      header: 1
    }) as string[][]
    const familiaresRows = XLSX.utils.sheet_to_json(workbook.Sheets.Familiares, {
      header: 1
    }) as string[][]
    const allRows = XLSX.utils.sheet_to_json(workbook.Sheets["Todos os visitantes"], {
      header: 1
    }) as string[][]

    expect(visitantesRows[1]?.[0]).toBe("Maria Souza")
    expect(visitantesRows[1]?.[2]).toBe("(11) 99999-9999")
    expect(visitantesRows[1]?.[5]).toBe("Orar pela familia")

    expect(familiaresRows[0]).toEqual([
      "Nome do visitante",
      "Parentesco com o visitante",
      "Nome do familiar",
      "Data de nascimento do familiar",
      "Telefone do familiar"
    ])

    expect(familiaresRows[1]?.[0]).toBe("Maria Souza")
    expect(familiaresRows[1]?.[1]).toBe("Filho(a)")
    expect(familiaresRows[1]?.[2]).toBe("Pedro Souza")
    expect(familiaresRows[1]?.[4]).toBe("(21) 98888-7777")

    expect(allRows[0]).not.toContain("Relacionamento ID")
    expect(allRows[0]).not.toContain("Visitante Principal ID")
    expect(allRows[0]).not.toContain("Membro ID")
    expect(allRows[0]).not.toContain("Documento")
    expect(allRows[0]).not.toContain("Batizado")
    expect(allRows[0]).not.toContain("Como Conheceu (outro)")
    expect(allRows[0]).not.toContain("Data de Atualizacao")
    expect(allRows[1]?.[0]).toBe("Visitante")
    expect(allRows[1]?.[3]).toBe("Maria Souza")
    expect(allRows[1]?.[5]).toBe("(11) 99999-9999")
    expect(allRows[1]?.[9]).toBe("Orar pela familia")
    expect(allRows[2]?.[0]).toBe("Filho(a)")
    expect(allRows[2]?.[3]).toBe("Pedro Souza")
    expect(allRows[2]?.[5]).toBe("(21) 98888-7777")
    expect(allRows[2]?.[9]).toBe("")
  })
})
