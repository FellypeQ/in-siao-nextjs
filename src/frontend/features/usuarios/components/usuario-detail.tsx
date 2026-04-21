"use client";

import { UserPermissionsForm } from "@/frontend/features/usuarios/components/user-permissions-form";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Stack,
  Typography,
} from "@mui/material";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type UsuarioDetailProps = {
  usuarioId: string;
};

type UsuarioDetailData = {
  id: string;
  nome: string;
  sobrenome: string;
  email: string;
  role: "ADMIN" | "STAFF";
  status: "ATIVO" | "INATIVO";
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(value));
}

export function UsuarioDetail({ usuarioId }: UsuarioDetailProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [usuario, setUsuario] = useState<UsuarioDetailData | null>(null);

  useEffect(() => {
    async function loadUsuario() {
      try {
        setLoading(true);
        setErrorMessage("");

        const response = await fetch(`/api/usuarios/${usuarioId}`);
        const result = (await response.json()) as {
          success: boolean;
          usuario?: UsuarioDetailData;
          error?: { message?: string };
        };

        if (!response.ok || !result.usuario) {
          throw new Error(
            result.error?.message ?? "Nao foi possivel carregar usuario",
          );
        }

        setUsuario(result.usuario);
      } catch (error) {
        setErrorMessage(
          error instanceof Error ? error.message : "Erro ao carregar usuario",
        );
      } finally {
        setLoading(false);
      }
    }

    void loadUsuario();
  }, [usuarioId]);

  if (loading || !usuario) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Stack spacing={2.5}>
      {errorMessage && <Alert severity="error">{errorMessage}</Alert>}

      <Card>
        <CardContent>
          <Stack spacing={1.2}>
            <Typography>
              <strong>Nome:</strong> {usuario.nome}
            </Typography>
            <Typography>
              <strong>Sobrenome:</strong> {usuario.sobrenome}
            </Typography>
            <Typography>
              <strong>Email:</strong> {usuario.email}
            </Typography>
            <Typography>
              <strong>Role:</strong> {usuario.role}
            </Typography>
            <Typography>
              <strong>Status:</strong>{" "}
              {usuario.status === "ATIVO" ? "Ativo" : "Inativo"}
            </Typography>
            <Typography>
              <strong>Criado em:</strong> {formatDateTime(usuario.createdAt)}
            </Typography>
            <Typography>
              <strong>Atualizado em:</strong>{" "}
              {formatDateTime(usuario.updatedAt)}
            </Typography>
            {usuario.deletedAt && (
              <Typography>
                <strong>Inativado em:</strong>{" "}
                {formatDateTime(usuario.deletedAt)}
              </Typography>
            )}

            <UserPermissionsForm usuarioId={usuario.id} readOnly />

            <Stack direction="row" spacing={1.5} sx={{ pt: 1 }}>
              <Button
                variant="contained"
                onClick={() =>
                  router.push(`/admin/usuarios/${usuario.id}/editar`)
                }
              >
                Editar
              </Button>
              <Button
                variant="outlined"
                onClick={() => router.push("/admin/usuarios")}
              >
                Voltar para listagem
              </Button>
            </Stack>
          </Stack>
        </CardContent>
      </Card>
    </Stack>
  );
}
