"use client"

import { useCallback, useEffect, useState } from "react"
import {
  Box,
  Button,
  CircularProgress,
  Step,
  StepLabel,
  Stepper,
  Typography,
} from "@mui/material"
import { EnviarMensagemDialog } from "@/frontend/features/visitantes/components/enviar-mensagem-dialog"
import { generateWhatsAppLink } from "@/frontend/shared/utils/generate-whatsapp-link"

type Template = {
  id: string
  title: string
  body: string
  order: number
}

type SentLog = {
  id: string
  messageTemplateId: string | null
  messageTitle: string
  sentAt: string
}

type NextTemplate = {
  id: string
  title: string
  processedBody: string
}

type MensagensData = {
  templates: Template[]
  sentLogs: SentLog[]
  nextTemplate: NextTemplate | null
}

type VisitanteMensagensStepperProps = {
  visitanteId: string
  visitantePhone: string | null
  canEnviar: boolean
}

export function VisitanteMensagensStepper({
  visitanteId,
  visitantePhone,
  canEnviar,
}: VisitanteMensagensStepperProps) {
  const [data, setData] = useState<MensagensData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [sending, setSending] = useState(false)

  const loadMensagens = useCallback(async () => {
    try {
      setLoading(true)
      setError("")
      const res = await fetch(`/api/visitantes/${visitanteId}/mensagens`)
      if (!res.ok) throw new Error("Não foi possível carregar mensagens")
      const json = (await res.json()) as MensagensData
      setData(json)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao carregar mensagens")
    } finally {
      setLoading(false)
    }
  }, [visitanteId])

  useEffect(() => {
    void loadMensagens()
  }, [loadMensagens])

  async function handleConfirmEnvio() {
    if (!data?.nextTemplate) return

    try {
      setSending(true)
      const res = await fetch(`/api/visitantes/${visitanteId}/mensagens`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messageTemplateId: data.nextTemplate.id }),
      })

      if (!res.ok) {
        const result = (await res.json()) as { error?: { message?: string } }
        throw new Error(result.error?.message ?? "Erro ao registrar envio")
      }

      if (visitantePhone) {
        const link = generateWhatsAppLink("55" + visitantePhone, data.nextTemplate.processedBody)
        window.open(link, "_blank", "noopener,noreferrer")
      }

      setDialogOpen(false)
      await loadMensagens()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao enviar mensagem")
      setDialogOpen(false)
    } finally {
      setSending(false)
    }
  }

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 3 }}>
        <CircularProgress size={24} />
      </Box>
    )
  }

  if (error) {
    return (
      <Typography color="error" variant="body2">
        {error}
      </Typography>
    )
  }

  if (!data || data.templates.length === 0) {
    return (
      <Typography color="text.secondary" variant="body2">
        Nenhum template de mensagem cadastrado.
      </Typography>
    )
  }

  const sentTemplateIds = new Set(data.sentLogs.map((l) => l.messageTemplateId).filter(Boolean))
  const activeStep = data.templates.filter((t) => sentTemplateIds.has(t.id)).length

  return (
    <Box>
      <Stepper activeStep={activeStep} orientation="horizontal" alternativeLabel>
        {data.templates.map((template) => {
          const done = sentTemplateIds.has(template.id)
          return (
            <Step key={template.id} completed={done}>
              <StepLabel>{template.title}</StepLabel>
            </Step>
          )
        })}
      </Stepper>

      {canEnviar && data.nextTemplate && (
        <Box sx={{ mt: 2 }}>
          <Button variant="outlined" onClick={() => setDialogOpen(true)}>
            Enviar próxima mensagem
          </Button>
        </Box>
      )}

      {canEnviar && !data.nextTemplate && data.templates.length > 0 && (
        <Typography variant="body2" color="success.main" sx={{ mt: 1 }}>
          Todas as mensagens programadasforam enviadas.
        </Typography>
      )}

      <EnviarMensagemDialog
        open={dialogOpen}
        nextTemplate={data.nextTemplate}
        visitantePhone={visitantePhone}
        sending={sending}
        onConfirm={() => void handleConfirmEnvio()}
        onClose={() => setDialogOpen(false)}
      />
    </Box>
  )
}
