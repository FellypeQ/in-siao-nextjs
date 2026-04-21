"use client";

import { UserPermissionsForm } from "@/frontend/features/usuarios/components/user-permissions-form";
import { ROLE_TRANSLATIONS } from "@/shared/constants/role-translations";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  MenuItem,
  Stack,
  Tab,
  Tabs,
  TextField,
} from "@mui/material";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type UsuarioFormProps = {
  usuarioId: string;
  currentUserId: string;
  currentUserRole: "ADMIN" | "STAFF" | "MASTER";
};

type UsuarioDetailData = {
  id: string;
  nome: string;
  sobrenome: string;
  email: string;
  role: "ADMIN" | "STAFF" | "MASTER";
  status: "ATIVO" | "INATIVO";
};

export function UsuarioForm({ usuarioId, currentUserId, currentUserRole }: UsuarioFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [state, setState] = useState<UsuarioDetailData | null>(null);
  const [activeTab, setActiveTab] = useState(0);

  const isSelfEdit = state?.id === currentUserId;

  const availableRoles: Array<"ADMIN" | "STAFF" | "MASTER"> =
    currentUserRole === "MASTER" ? ["MASTER", "ADMIN", "STAFF"] : ["ADMIN", "STAFF"];

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
    if (!state) return;

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
        usuario?: UsuarioDetailData;
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
      {errorMessage && <Alert severity="error">{errorMessage}</Alert>}
      {successMessage && <Alert severity="success">{successMessage}</Alert>}

      <Tabs value={activeTab} onChange={(_, value: number) => setActiveTab(value)}>
        <Tab label="Dados" />
        <Tab label="Permissoes" />
      </Tabs>

      {activeTab === 0 && (
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
                    current ? { ...current, sobrenome: event.target.value } : current,
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
                label="Papel"
                value={state.role}
                onChange={(event) =>
                  setState((current) =>
                    current
                      ? { ...current, role: event.target.value as "ADMIN" | "STAFF" | "MASTER" }
                      : current,
                  )
                }
                disabled={isSelfEdit}
                helperText={
                  isSelfEdit ? "Nao e permitido alterar o proprio papel" : undefined
                }
                fullWidth
              >
                {availableRoles.map((role) => (
                  <MenuItem key={role} value={role}>
                    {ROLE_TRANSLATIONS[role]}
                  </MenuItem>
                ))}
              </TextField>

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
      )}

      {activeTab === 1 && (
        <Card>
          <CardContent>
            <UserPermissionsForm usuarioId={usuarioId} />
          </CardContent>
        </Card>
      )}
    </Stack>
  );
}
