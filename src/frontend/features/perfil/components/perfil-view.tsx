"use client";

import { PerfilDadosForm } from "@/frontend/features/perfil/components/perfil-dados-form";
import { PerfilSenhaForm } from "@/frontend/features/perfil/components/perfil-senha-form";
import {
  Alert,
  Box,
  CircularProgress,
  Container,
  Stack,
  Typography,
} from "@mui/material";
import { useEffect, useState } from "react";

type PerfilResponse = {
  id: string;
  nome: string;
  sobrenome: string;
  email: string;
  role: "ADMIN" | "STAFF";
};

export function PerfilView() {
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [perfil, setPerfil] = useState<PerfilResponse | null>(null);

  useEffect(() => {
    async function loadProfile() {
      try {
        setLoading(true);
        setErrorMessage("");

        const response = await fetch("/api/usuarios/me");
        const result = (await response.json()) as {
          success: boolean;
          perfil?: PerfilResponse;
          error?: { message?: string };
        };

        if (!response.ok || !result.perfil) {
          throw new Error(
            result.error?.message ?? "Nao foi possivel carregar perfil",
          );
        }

        setPerfil(result.perfil);
      } catch (error) {
        setErrorMessage(
          error instanceof Error ? error.message : "Erro ao carregar perfil",
        );
      } finally {
        setLoading(false);
      }
    }

    void loadProfile();
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!perfil) {
    return (
      <Alert severity="error">
        {errorMessage || "Nao foi possivel carregar os dados do perfil"}
      </Alert>
    );
  }

  return (
    <Stack spacing={2.5}>
      <Typography variant="h4" sx={{ fontWeight: 800 }}>
        Meu Perfil
      </Typography>

      <Alert severity="info">
        Depois de alterar seus dados pessoais, faça logout e login para
        atualizar o nome exibido na sessao atual.
      </Alert>

      {errorMessage && <Alert severity="error">{errorMessage}</Alert>}

      <PerfilDadosForm
        nome={perfil.nome}
        sobrenome={perfil.sobrenome}
        email={perfil.email}
        onUpdated={(nome, sobrenome) =>
          setPerfil((current) =>
            current ? { ...current, nome, sobrenome } : current,
          )
        }
      />

      <PerfilSenhaForm />
    </Stack>
  );
}
