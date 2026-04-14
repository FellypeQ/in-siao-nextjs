"use client"

import DownloadIcon from "@mui/icons-material/Download"
import { Button, CircularProgress } from "@mui/material"
import { useState } from "react"

type ExportVisitantesButtonProps = {
  onError: (message: string) => void
  createdFrom?: string
  createdTo?: string
}

function getFileNameFromDisposition(contentDisposition: string | null) {
  if (!contentDisposition) {
    return "visitantes.xlsx"
  }

  const match = contentDisposition.match(/filename=\"?([^\";]+)\"?/i)

  return match?.[1] ?? "visitantes.xlsx"
}

function buildExportUrl(createdFrom?: string, createdTo?: string) {
  const params = new URLSearchParams()

  if (createdFrom) {
    params.set("createdFrom", createdFrom)
  }

  if (createdTo) {
    params.set("createdTo", createdTo)
  }

  const query = params.toString()

  return query ? `/api/visitantes/export?${query}` : "/api/visitantes/export"
}

export function ExportVisitantesButton({
  onError,
  createdFrom,
  createdTo
}: ExportVisitantesButtonProps) {
  const [loading, setLoading] = useState(false)

  async function handleExport() {
    try {
      setLoading(true)
      onError("")

      if (createdFrom && createdTo && createdFrom > createdTo) {
        throw new Error("Periodo de exportacao invalido: a data inicial deve ser menor ou igual a final")
      }

      const response = await fetch(buildExportUrl(createdFrom, createdTo))

      if (!response.ok) {
        const data = (await response.json()) as { error?: { message?: string } }
        throw new Error(data.error?.message ?? "Nao foi possivel exportar visitantes")
      }

      const blob = await response.blob()
      const fileName = getFileNameFromDisposition(response.headers.get("content-disposition"))
      const objectUrl = URL.createObjectURL(blob)
      const anchor = document.createElement("a")

      anchor.href = objectUrl
      anchor.download = fileName
      anchor.click()
      URL.revokeObjectURL(objectUrl)
    } catch (error) {
      onError(error instanceof Error ? error.message : "Erro ao exportar visitantes")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button
      variant="outlined"
      onClick={() => void handleExport()}
      disabled={loading}
      startIcon={loading ? <CircularProgress size={16} color="inherit" /> : <DownloadIcon />}
    >
      Exportar Excel
    </Button>
  )
}
