"use client";

import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
} from "@mui/material";

type DeleteUsuarioDialogProps = {
  open: boolean;
  loading: boolean;
  usuarioNome: string;
  onCancel: () => void;
  onConfirm: () => void;
};

export function DeleteUsuarioDialog({
  open,
  loading,
  usuarioNome,
  onCancel,
  onConfirm,
}: DeleteUsuarioDialogProps) {
  return (
    <Dialog
      open={open}
      onClose={loading ? undefined : onCancel}
      fullWidth
      maxWidth="sm"
    >
      <DialogTitle>Confirmar exclusao</DialogTitle>
      <DialogContent>
        <Typography>
          Tem certeza que deseja inativar o usuario{" "}
          <strong>{usuarioNome}</strong>? Esta acao aplica soft delete.
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onCancel} disabled={loading}>
          Cancelar
        </Button>
        <Button
          color="error"
          variant="contained"
          onClick={onConfirm}
          disabled={loading}
        >
          Confirmar
        </Button>
      </DialogActions>
    </Dialog>
  );
}
