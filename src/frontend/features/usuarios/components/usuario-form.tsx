"use client";

import { UserPermissionsForm } from "@/frontend/features/usuarios/components/user-permissions-form";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type UsuarioFormProps = {
  usuarioId: string;
  currentUserId: string;
};

type UsuarioDetail = {
  id: string;
  nome: string;
  sobrenome: string;
  email: string;
  role: "ADMIN" | "STAFF";
  status: "ATIVO" | "INATIVO";
};

export function UsuarioForm({ usuarioId, currentUserId }: UsuarioFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [state, setState] = useState<UsuarioDetail | null>(null);

  const isSelfEdit = state?.id === currentUserId;

  useEffect(() => {
    async function loadUsuario() {
      try {
        setLoading(true);
        setErrorMessage("");

        const response = await fetch(`/api/usuarios/${usuarioId}`);
        const result = (await response.json()) as {
          success: boolean;
          usuario?: UsuarioDetail;
          error?: { message?: string };
        };

        if (!response.ok || !result.usuario) {
          throw new Error(
            result.error?.message ?? "Nao foi possivel carregar usuario",
          );
        }

        setState(result.usuario);
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

  async function handleSubmit() {
    if (!state) {
      return;
    }

    try {
      setSaving(true);
      setErrorMessage("");
      setSuccessMessage("");

      const response = await fetch(`/api/usuarios/${usuarioId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nome: state.nome,
          sobrenome: state.sobrenome,
          email: state.email,
          role: state.role,
        }),
      });

      const result = (await response.json()) as {
        success: boolean;
        usuario?: UsuarioDetail;
        error?: { message?: string };
      };

      if (!response.ok || !result.usuario) {
        throw new Error(
          result.error?.message ?? "Nao foi possivel atualizar usuario",
        );
      }

      setState(result.usuario);
      setSuccessMessage("Usuario atualizado com sucesso");
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Erro ao atualizar usuario",
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading || !state) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Stack spacing={2.5}>
      <Typography variant="h4" sx={{ fontWeight: 800 }}>
        Editar usuario
      </Typography>

      {errorMessage && <Alert severity="error">{errorMessage}</Alert>}
      {successMessage && <Alert severity="success">{successMessage}</Alert>}

      <Card>
        <CardContent>
          <Stack spacing={2}>
            <TextField
              label="Nome"
              value={state.nome}
              onChange={(event) =>
                setState((current) =>
                  current ? { ...current, nome: event.target.value } : current,
                )
              }
              fullWidth
            />
            <TextField
              label="Sobrenome"
              value={state.sobrenome}
              onChange={(event) =>
                setState((current) =>
                  current
                    ? { ...current, sobrenome: event.target.value }
                    : current,
                )
              }
              fullWidth
            />
            <TextField
              label="Email"
              type="email"
              value={state.email}
              onChange={(event) =>
                setState((current) =>
                  current ? { ...current, email: event.target.value } : current,
                )
              }
              fullWidth
            />
            <TextField
              select
              label="Role"
              value={state.role}
              onChange={(event) =>
                setState((current) =>
                  current
                    ? {
                        ...current,
                        role: event.target.value as "ADMIN" | "STAFF",
                      }
                    : current,
                )
              }
              disabled={isSelfEdit}
              helperText={
                isSelfEdit
                  ? "Nao e permitido alterar o proprio papel"
                  : undefined
              }
              fullWidth
            >
              <MenuItem value="ADMIN">ADMIN</MenuItem>
              <MenuItem value="STAFF">STAFF</MenuItem>
            </TextField>

            <UserPermissionsForm usuarioId={usuarioId} />

            <Stack direction="row" spacing={1.5}>
              <Button
                variant="contained"
                disabled={saving}
                onClick={() => void handleSubmit()}
              >
                Salvar
              </Button>
              <Button
                variant="outlined"
                onClick={() => router.push(`/admin/usuarios/${usuarioId}`)}
              >
                Voltar
              </Button>
            </Stack>
          </Stack>
        </CardContent>
      </Card>
    </Stack>
  );
}
