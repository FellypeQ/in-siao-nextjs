import * as XLSX from "xlsx"

import {
  translateActualChurch,
  translateHowKnow,
  translateRelationshipType
} from "@/frontend/features/visitantes/constants/visitante-enum-translations"
import { listVisitantesForExportRepository } from "@/modules/visitantes/repositories/list-visitantes-for-export.repository"
import type { ExportVisitantesInput } from "@/modules/visitantes/schemas/export-visitantes.schema"

function formatCivilDate(date: Date): string {
  const year = date.getUTCFullYear()
  const month = String(date.getUTCMonth() + 1).padStart(2, "0")
  const day = String(date.getUTCDate()).padStart(2, "0")

  return `${day}/${month}/${year}`
}

function formatIsoDate(date: Date): string {
  const year = date.getUTCFullYear()
  const month = String(date.getUTCMonth() + 1).padStart(2, "0")
  const day = String(date.getUTCDate()).padStart(2, "0")

  return `${year}-${month}-${day}`
}

function formatDateTime(date: Date): string {
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
    timeZone: "UTC"
  }).format(date)
}

export async function exportVisitantesExcelService(input: ExportVisitantesInput) {
  const visitantes = await listVisitantesForExportRepository(input)

  const visitantesSheetData: Array<Array<string>> = [
    [
      "Visitante ID",
      "Nome",
      "Data de nascimento",
      "Telefone",
      "Documento",
      "Batizado",
      "Igreja atual",
      "Como conheceu",
      "Outra resposta (como conheceu)",
      "Pedido de oracao",
      "Criado em"
    ],
    ...visitantes.map((item) => [
      item.id,
      item.name,
      formatCivilDate(item.birthDate),
      item.phone ?? "",
      item.document ?? "",
      item.baptized ? "Sim" : "Nao",
      translateActualChurch(item.visitorProfile?.actualChurch ?? ""),
      translateHowKnow(item.visitorProfile?.howKnow ?? ""),
      item.visitorProfile?.howKnowOtherAnswer ?? "",
      item.memberPrays[0]?.pray.text ?? "",
      formatDateTime(item.createdAt)
    ])
  ]

  const familiaresSheetData: Array<Array<string>> = [
    [
      "Visitante ID",
      "Visitante nome",
      "Relacionamento ID",
      "Parentesco",
      "Familiar ID",
      "Familiar nome",
      "Familiar data de nascimento",
      "Familiar telefone"
    ],
    ...visitantes.flatMap((item) =>
      item.principalRelations.map((relationship) => [
        item.id,
        item.name,
        relationship.id,
        translateRelationshipType(relationship.relationshipType),
        relationship.relatedMember.id,
        relationship.relatedMember.name,
        formatCivilDate(relationship.relatedMember.birthDate),
        relationship.relatedMember.phone ?? ""
      ])
    )
  ]

  const workbook = XLSX.utils.book_new()
  const visitantesSheet = XLSX.utils.aoa_to_sheet(visitantesSheetData)
  const familiaresSheet = XLSX.utils.aoa_to_sheet(familiaresSheetData)

  XLSX.utils.book_append_sheet(workbook, visitantesSheet, "Visitantes")
  XLSX.utils.book_append_sheet(workbook, familiaresSheet, "Familiares")

  const file = XLSX.write(workbook, {
    bookType: "xlsx",
    type: "array"
  }) as ArrayBuffer

  const dateSuffix = formatIsoDate(new Date())

  return {
    file,
    fileName: `visitantes-${dateSuffix}.xlsx`,
    totalVisitantes: visitantes.length
  }
}
