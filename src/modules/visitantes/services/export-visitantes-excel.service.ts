import * as XLSX from "xlsx";

import { formatPhone } from "@/frontend/shared/utils/format-phone";
import {
  translateActualChurch,
  translateHowKnow,
  translateRelationshipType,
} from "@/frontend/features/visitantes/constants/visitante-enum-translations";
import { listVisitantesForExportRepository } from "@/modules/visitantes/repositories/list-visitantes-for-export.repository";
import type { ExportVisitantesInput } from "@/modules/visitantes/schemas/export-visitantes.schema";

function formatCivilDate(date: Date): string {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");

  return `${day}/${month}/${year}`;
}

function formatIsoDate(date: Date): string {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function formatDateTime(date: Date): string {
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
    timeZone: "UTC",
  }).format(date);
}

const exportHeaders = [
  "Tipo de Linha",
  "Tipo de Relacionamento",
  "Visitante Principal (nome)",
  "Nome",
  "Data de Nascimento",
  "Telefone",
  "Igreja Atual",
  "Como Conheceu",
  "Pedido de Oracao",
  "Data de cadastro",
] as const;

type ExportHeader = (typeof exportHeaders)[number];
type ExportRow = Record<ExportHeader, string>;

function createPrincipalRow(
  visitante: Awaited<
    ReturnType<typeof listVisitantesForExportRepository>
  >[number],
): ExportRow {
  return {
    "Tipo de Linha": "Visitante",
    "Tipo de Relacionamento": "",
    "Visitante Principal (nome)": visitante.name,
    Nome: visitante.name,
    "Data de Nascimento": formatCivilDate(visitante.birthDate),
    Telefone: visitante.phone ? formatPhone(visitante.phone) : "",
    "Igreja Atual": translateActualChurch(
      visitante.visitorProfile?.actualChurch ?? "",
    ),
    "Como Conheceu": translateHowKnow(visitante.visitorProfile?.howKnow ?? ""),
    "Pedido de Oracao": visitante.memberPrays[0]?.pray.text ?? "",
    "Data de cadastro": formatDateTime(visitante.createdAt),
  };
}

function createFamilyRow(
  visitante: Awaited<
    ReturnType<typeof listVisitantesForExportRepository>
  >[number],
  relationship: Awaited<
    ReturnType<typeof listVisitantesForExportRepository>
  >[number]["principalRelations"][number],
): ExportRow {
  const relatedMember = relationship.relatedMember;

  return {
    "Tipo de Linha": translateRelationshipType(relationship.relationshipType),
    "Tipo de Relacionamento": translateRelationshipType(
      relationship.relationshipType,
    ),
    "Visitante Principal (nome)": visitante.name,
    Nome: relatedMember.name,
    "Data de Nascimento": formatCivilDate(relatedMember.birthDate),
    Telefone: relatedMember.phone ? formatPhone(relatedMember.phone) : "",
    "Igreja Atual": "",
    "Como Conheceu": "",
    "Pedido de Oracao": "",
    "Data de cadastro": formatDateTime(relatedMember.createdAt),
  };
}

export async function exportVisitantesExcelService(
  input: ExportVisitantesInput,
) {
  const visitantes = await listVisitantesForExportRepository(input);

  const visitantesSheetData: Array<Array<string>> = [
    [
      "Nome",
      "Data de nascimento",
      "Telefone",
      "Igreja atual",
      "Como conheceu",
      "Pedido de oracao",
      "Data de cadastro",
    ],
    ...visitantes.map((item) => [
      item.name,
      formatCivilDate(item.birthDate),
      item.phone ? formatPhone(item.phone) : "",
      translateActualChurch(item.visitorProfile?.actualChurch ?? ""),
      translateHowKnow(item.visitorProfile?.howKnow ?? ""),
      item.memberPrays[0]?.pray.text ?? "",
      formatDateTime(item.createdAt),
    ]),
  ];

  const familiaresSheetData: Array<Array<string>> = [
    [
      "Nome do visitante",
      "Parentesco com o visitante",
      "Nome do familiar",
      "Data de nascimento do familiar",
      "Telefone do familiar",
    ],
    ...visitantes.flatMap((item) =>
      item.principalRelations.map((relationship) => [
        item.name,
        translateRelationshipType(relationship.relationshipType),
        relationship.relatedMember.name,
        formatCivilDate(relationship.relatedMember.birthDate),
        relationship.relatedMember.phone
          ? formatPhone(relationship.relatedMember.phone)
          : "",
      ]),
    ),
  ];

  const baseRows = visitantes.flatMap((visitante) => [
    createPrincipalRow(visitante),
    ...visitante.principalRelations.map((relationship) =>
      createFamilyRow(visitante, relationship),
    ),
  ]);

  const rowsAsArray = baseRows.map((row) =>
    exportHeaders.map((header) => row[header]),
  );
  const sheetData: Array<Array<string>> = [
    Array.from(exportHeaders),
    ...rowsAsArray,
  ];

  const workbook = XLSX.utils.book_new();
  const visitantesSheet = XLSX.utils.aoa_to_sheet(visitantesSheetData);
  const familiaresSheet = XLSX.utils.aoa_to_sheet(familiaresSheetData);
  const allVisitorsSheet = XLSX.utils.aoa_to_sheet(sheetData);

  const lastColumn = XLSX.utils.encode_col(exportHeaders.length - 1);
  const lastRow = Math.max(sheetData.length, 1);
  const autoFilterRange = `A1:${lastColumn}${lastRow}`;

  allVisitorsSheet["!autofilter"] = { ref: autoFilterRange };
  allVisitorsSheet["!freeze"] = {
    xSplit: 0,
    ySplit: 1,
    topLeftCell: "A2",
    activePane: "bottomLeft",
    state: "frozen",
  };

  XLSX.utils.book_append_sheet(workbook, visitantesSheet, "Visitantes");
  XLSX.utils.book_append_sheet(workbook, familiaresSheet, "Familiares");
  XLSX.utils.book_append_sheet(
    workbook,
    allVisitorsSheet,
    "Todos os visitantes",
  );

  const file = XLSX.write(workbook, {
    bookType: "xlsx",
    type: "array",
  }) as ArrayBuffer;

  const dateSuffix = formatIsoDate(new Date());

  return {
    file,
    fileName: `visitantes-${dateSuffix}.xlsx`,
    totalVisitantes: visitantes.length,
  };
}
