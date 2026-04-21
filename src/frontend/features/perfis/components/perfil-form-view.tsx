"use client";

import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  CircularProgress,
  FormControlLabel,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import {
  PERMISSIONS_BY_MODULE,
  type PermissionKey,
} from "@/shared/constants/permissions";

const permissionLabels: Record<PermissionKey, string> = {
  VISITANTES_CADASTRAR: "Cadastrar visitantes",
  VISITANTES_LISTAR: "Listar visitantes",
  VISITANTES_EDITAR: "Editar visitantes",
  VISITANTES_EXCLUIR: "Excluir visitantes",
  VISITANTES_EXPORTAR: "Exportar visitantes",
  CULTO_INFANTIL_SELECIONAR: "Selecionar no culto infantil",
  MENSAGENS_GERENCIAR: "Gerenciar mensagens",
  MENSAGENS_ENVIAR: "Enviar mensagens",
};

type PerfilFormViewProps = {
  perfilId?: string;
};

export function PerfilFormView({ perfilId }: PerfilFormViewProps) {
  const router = useRouter();
  const isEdit = Boolean(perfilId);

  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [nome, setNome] = useState("");
  const [selectedPermissions, setSelectedPermissions] = useState<PermissionKey[]>([]);

  useEffect(() => {
    if (!perfilId) return;

    async function loadPerfil() {
      try {
        setLoading(true);
        setErrorMessage("");

        const response = await fetch(`/api/perfis/${perfilId}`);
        const result = (await response.json()) as {
          success: boolean;
          perfil?: { id: string; nome: string; permissions: PermissionKey[] };
          error?: { message?: string };
        };

        if (!response.ok || !result.perfil) {
          throw new Error(result.error?.message ?? "Nao foi possivel carregar perfil");
        }

        setNome(result.perfil.nome);
        setSelectedPermissions(result.perfil.permissions);
      } catch (error) {
        setErrorMessage(
          error instanceof Error ? error.message : "Erro ao carregar perfil",
        );
      } finally {
        setLoading(false);
      }
    }

    void loadPerfil();
  }, [perfilId]);

  function togglePermission(permission: PermissionKey) {
    setSelectedPermissions((current) =>
      current.includes(permission)
        ? current.filter((p) => p !== permission)
        : [...current, permission],
    );
  }

  async function handleSubmit() {
    try {
      setSaving(true);
      setErrorMessage("");
      setSuccessMessage("");

      const url = isEdit ? `/api/perfis/${perfilId}` : "/api/perfis";
      const method = isEdit ? "PATCH" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nome, permissions: selectedPermissions }),
      });

      const result = (await response.json()) as {
        success: boolean;
        perfil?: { id: string };
        error?: { message?: string };
      };

      if (!response.ok || !result.success) {
        throw new Error(result.error?.message ?? "Nao foi possivel salvar perfil");
      }

      if (isEdit) {
        setSuccessMessage("Perfil atualizado com sucesso.");
      } else {
        router.push("/admin/perfis");
      }
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Erro ao salvar perfil",
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
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

      <Card>
        <CardContent>
          <Stack spacing={3}>
            <TextField
              label="Nome do perfil"
              value={nome}
              onChange={(event) => setNome(event.target.value)}
              fullWidth
            />

            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1.5 }}>
                Permissoes
              </Typography>
              <Stack spacing={2}>
                {Object.entries(PERMISSIONS_BY_MODULE).map(([moduleName, modulePermissions]) => (
                  <Box key={moduleName}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.5 }}>
                      {moduleName}
                    </Typography>
                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0 }}>
                      {modulePermissions.map((permission) => (
                        <FormControlLabel
                          key={permission}
                          sx={{
                            m: 0,
                            flex: {
                              xs: "1 1 100%",
                              sm: "1 1 calc(50% - 8px)",
                              md: "1 1 calc(33.333% - 8px)",
                            },
                          }}
                          control={
                            <Checkbox
                              checked={selectedPermissions.includes(permission)}
                              onChange={() => togglePermission(permission)}
                            />
                          }
                          label={permissionLabels[permission]}
                        />
                      ))}
                    </Box>
                  </Box>
                ))}
              </Stack>
            </Box>

            <Stack direction="row" spacing={1.5}>
              <Button
                variant="contained"
                disabled={saving || !nome.trim()}
                onClick={() => void handleSubmit()}
              >
                {isEdit ? "Salvar alteracoes" : "Criar perfil"}
              </Button>
              <Button variant="outlined" onClick={() => router.push("/admin/perfis")}>
                Cancelar
              </Button>
            </Stack>
          </Stack>
        </CardContent>
      </Card>
    </Stack>
  );
}
