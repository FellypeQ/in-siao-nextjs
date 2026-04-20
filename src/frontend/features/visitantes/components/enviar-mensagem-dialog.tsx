"use client"

import {
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Stack,
  Typography,
} from "@mui/material"
import { generateWhatsAppLink } from "@/frontend/shared/utils/generate-whatsapp-link"

type NextTemplate = {
  id: string
  title: string
  processedBody: string
}

type EnviarMensagemDialogProps = {
  open: boolean
  nextTemplate: NextTemplate | null
  visitantePhone: string | null
  sending: boolean
  onConfirm: () => void
  onClose: () => void
}

export function EnviarMensagemDialog({
  open,
  nextTemplate,
  visitantePhone,
  sending,
  onConfirm,
  onClose,
}: EnviarMensagemDialogProps) {
  const whatsAppLink =
    nextTemplate && visitantePhone
      ? generateWhatsAppLink("55" + visitantePhone, nextTemplate.processedBody)
      : null

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Enviar próxima mensagem</DialogTitle>
      <DialogContent dividers>
        {!nextTemplate ? (
          <Typography color="text.secondary">Nenhuma mensagem pendente para este visitante.</Typography>
        ) : (
          <Stack spacing={2}>
            <Typography variant="subtitle2" color="text.secondary">
              Título
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              {nextTemplate.title}
            </Typography>
            <Divider />
            <Typography variant="subtitle2" color="text.secondary">
              Mensagem
            </Typography>
            <Typography variant="body2" sx={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
              {nextTemplate.processedBody}
            </Typography>
            {visitantePhone && (
              <>
                <Divider />
                <Typography variant="subtitle2" color="text.secondary">
                  Destino
                </Typography>
                <Typography variant="body2">+55 {visitantePhone}</Typography>
              </>
            )}
            {!visitantePhone && (
              <Typography color="warning.main" variant="body2">
                Este visitante não possui telefone cadastrado.
              </Typography>
            )}
          </Stack>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={sending}>
          Cancelar
        </Button>
        <Button
          variant="contained"
          disabled={sending || !nextTemplate || !whatsAppLink}
          onClick={() => {
            onConfirm()
          }}
        >
          {sending ? <CircularProgress size={20} color="inherit" /> : "Confirmar e abrir WhatsApp"}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

