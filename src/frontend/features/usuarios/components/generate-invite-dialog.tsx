"use client";

import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useState } from "react";

type InviteRole = "ADMIN" | "STAFF";

type GenerateInviteDialogProps = {
  open: boolean;
  onClose: () => void;
};

export function GenerateInviteDialog({
  open,
  onClose,
}: GenerateInviteDialogProps) {
  const [role, setRole] = useState<InviteRole>("STAFF");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [inviteLink, setInviteLink] = useState("");
  const [copied, setCopied] = useState(false);

  async function handleGenerateInvite() {
    try {
      setLoading(true);
      setErrorMessage("");
      setCopied(false);

      const response = await fetch("/api/usuarios/convites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role }),
      });

      const result = (await response.json()) as {
        success: boolean;
        link?: string;
        error?: { message?: string };
      };

      if (!response.ok || !result.link) {
        throw new Error(result.error?.message ?? "Nao foi possivel gerar convite");
      }

      setInviteLink(result.link);
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Erro ao gerar convite",
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleCopy() {
    if (!inviteLink) {
      return;
    }

    await navigator.clipboard.writeText(inviteLink);
    setCopied(true);
  }

  function handleClose() {
    if (loading) {
      return;
    }

    setRole("STAFF");
    setErrorMessage("");
    setInviteLink("");
    setCopied(false);
    onClose();
  }

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
      <DialogTitle>Gerar convite</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <FormControl fullWidth>
            <InputLabel id="invite-role-label">Role</InputLabel>
            <Select
              labelId="invite-role-label"
              label="Role"
              value={role}
              onChange={(event) => setRole(event.target.value as InviteRole)}
            >
              <MenuItem value="ADMIN">ADMIN</MenuItem>
              <MenuItem value="STAFF">STAFF</MenuItem>
            </Select>
          </FormControl>

          {errorMessage && <Alert severity="error">{errorMessage}</Alert>}

          {inviteLink && (
            <Stack spacing={1}>
              <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
                <TextField
                  value={inviteLink}
                  fullWidth
                  slotProps={{
                    input: {
                      readOnly: true,
                    },
                  }}
                />
                <IconButton
                  aria-label="Copiar link"
                  color="primary"
                  onClick={() => void handleCopy()}
                >
                  <ContentCopyIcon />
                </IconButton>
              </Stack>
              <Typography variant="body2" color="text.secondary">
                Este link e de uso unico. Compartilhe com a pessoa que devera criar
                a conta. Apos o cadastro ser realizado, o link sera invalidado
                automaticamente.
              </Typography>
              {copied && <Alert severity="success">Link copiado com sucesso</Alert>}
            </Stack>
          )}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={loading}>
          Fechar
        </Button>
        <Button variant="contained" onClick={() => void handleGenerateInvite()} disabled={loading}>
          Gerar link
        </Button>
      </DialogActions>
    </Dialog>
  );
}
