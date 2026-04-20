"use client";

import { PasswordField } from "@/frontend/components/inputs/password-field";
import {
  Alert,
  Button,
  Card,
  CardContent,
  Stack,
  Typography,
} from "@mui/material";
import { FormEvent, useState } from "react";

export function PerfilSenhaForm() {
  const [senhaAtual, setSenhaAtual] = useState("");
  const [novaSenha, setNovaSenha] = useState("");
  const [confirmacaoNovaSenha, setConfirmacaoNovaSenha] = useState("");
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const response = await fetch("/api/usuarios/me/senha", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          senhaAtual,
          novaSenha,
          confirmacaoNovaSenha,
        }),
      });

      const result = (await response.json()) as {
        success: boolean;
        error?: { message?: string };
      };

      if (!response.ok) {
        throw new Error(result.error?.message ?? "Nao foi possivel atualizar senha");
      }

      setSenhaAtual("");
      setNovaSenha("");
      setConfirmacaoNovaSenha("");
      setSuccessMessage(
        "Senha atualizada com sucesso. Faça logout e login para refletir os dados atualizados da sessao.",
      );
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Erro ao atualizar senha");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card>
      <CardContent>
        <Stack component="form" spacing={2} onSubmit={handleSubmit}>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            Alterar senha
          </Typography>

          {errorMessage && <Alert severity="error">{errorMessage}</Alert>}
          {successMessage && <Alert severity="success">{successMessage}</Alert>}

          <PasswordField
            label="Senha atual"
            value={senhaAtual}
            onChange={(event) => setSenhaAtual(event.target.value)}
            fullWidth
            required
          />

          <PasswordField
            label="Nova senha"
            value={novaSenha}
            onChange={(event) => setNovaSenha(event.target.value)}
            fullWidth
            required
          />

          <PasswordField
            label="Confirmar nova senha"
            value={confirmacaoNovaSenha}
            onChange={(event) => setConfirmacaoNovaSenha(event.target.value)}
            fullWidth
            required
          />

          <Button type="submit" variant="contained" disabled={saving}>
            Atualizar senha
          </Button>
        </Stack>
      </CardContent>
    </Card>
  );
}