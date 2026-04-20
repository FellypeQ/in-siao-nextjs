"use client"

import {
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
} from "@mui/material"

type DeleteTemplateDialogProps = {
  open: boolean
  templateTitle: string
  deleting: boolean
  onConfirm: () => void
  onClose: () => void
}

export function DeleteTemplateDialog({
  open,
  templateTitle,
  deleting,
  onConfirm,
  onClose,
}: DeleteTemplateDialogProps) {
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Excluir template</DialogTitle>
      <DialogContent>
        <Typography>
          Tem certeza que deseja excluir <strong>{templateTitle}</strong>? Templates que já foram enviados
          serão desativados; os demais serão removidos permanentemente.
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={deleting}>
          Cancelar
        </Button>
        <Button color="error" variant="contained" onClick={onConfirm} disabled={deleting}>
          {deleting ? <CircularProgress size={20} color="inherit" /> : "Excluir"}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
