"use client";

import {
  Alert,
  Button,
  Card,
  CardContent,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { FormEvent, useEffect, useState } from "react";

type PerfilDadosFormProps = {
  nome: string;
  sobrenome: string;
  email: string;
  onUpdated: (nome: string, sobrenome: string) => void;
};

export function PerfilDadosForm({
  nome,
  sobrenome,
  email,
  onUpdated,
}: PerfilDadosFormProps) {
  const [nomeValue, setNomeValue] = useState(nome);
  const [sobrenomeValue, setSobrenomeValue] = useState(sobrenome);
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    setNomeValue(nome);
    setSobrenomeValue(sobrenome);
  }, [nome, sobrenome]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const response = await fetch("/api/usuarios/me", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nome: nomeValue,
          sobrenome: sobrenomeValue,
        }),
      });

      const result = (await response.json()) as {
        success: boolean;
        error?: { message?: string };
      };

      if (!response.ok) {
        throw new Error(result.error?.message ?? "Nao foi possivel atualizar perfil");
      }

      const nomeAtualizado = nomeValue.trim();
      const sobrenomeAtualizado = sobrenomeValue.trim();

      onUpdated(nomeAtualizado, sobrenomeAtualizado);
      setNomeValue(nomeAtualizado);
      setSobrenomeValue(sobrenomeAtualizado);
      setSuccessMessage("Dados atualizados com sucesso");
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Erro ao atualizar dados do perfil",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card>
      <CardContent>
        <Stack component="form" spacing={2} onSubmit={handleSubmit}>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            Dados pessoais
          </Typography>

          {errorMessage && <Alert severity="error">{errorMessage}</Alert>}
          {successMessage && <Alert severity="success">{successMessage}</Alert>}

          <TextField
            label="Nome"
            value={nomeValue}
            onChange={(event) => setNomeValue(event.target.value)}
            fullWidth
            required
          />
          <TextField
            label="Sobrenome"
            value={sobrenomeValue}
            onChange={(event) => setSobrenomeValue(event.target.value)}
            fullWidth
            required
          />
          <TextField label="Email" value={email} fullWidth disabled />

          <Button type="submit" variant="contained" disabled={saving}>
            Salvar dados
          </Button>
        </Stack>
      </CardContent>
    </Card>
  );
}