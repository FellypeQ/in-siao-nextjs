"use client";

import {
  Alert,
  Box,
  Button,
  Checkbox,
  CircularProgress,
  FormControlLabel,
  Stack,
  Typography,
} from "@mui/material";
import { useEffect, useMemo, useState } from "react";

import {
  PERMISSIONS_BY_MODULE,
  type PermissionKey,
} from "@/shared/constants/permissions";

type UserPermissionsFormProps = {
  usuarioId: string;
  readOnly?: boolean;
};

const permissionLabels: Record<PermissionKey, string> = {
  VISITANTES_CADASTRAR: "Cadastrar visitantes",
  VISITANTES_LISTAR: "Listar visitantes",
  VISITANTES_EDITAR: "Editar visitantes",
  VISITANTES_EXCLUIR: "Excluir visitantes",
  VISITANTES_EXPORTAR: "Exportar visitantes",
  CULTO_INFANTIL_SELECIONAR: "Selecionar no culto infantil",
  MENSAGENS_GERENCIAR: "Gerenciar mensagens",
  MENSAGENS_ENVIAR: "Enviar mensagens"
};

export function UserPermissionsForm({
  usuarioId,
  readOnly = false,
}: UserPermissionsFormProps) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [selectedPermissions, setSelectedPermissions] = useState<PermissionKey[]>(
    [],
  );

  useEffect(() => {
    async function loadPermissions() {
      try {
        setLoading(true);
        setErrorMessage("");

        const response = await fetch(`/api/usuarios/${usuarioId}/permissoes`);
        const result = (await response.json()) as {
          success: boolean;
          permissions?: PermissionKey[];
          error?: { message?: string };
        };

        if (!response.ok || !result.permissions) {
          throw new Error(
            result.error?.message ?? "Nao foi possivel carregar permissoes",
          );
        }

        setSelectedPermissions(result.permissions);
      } catch (error) {
        setErrorMessage(
          error instanceof Error
            ? error.message
            : "Erro ao carregar permissoes",
        );
      } finally {
        setLoading(false);
      }
    }

    void loadPermissions();
  }, [usuarioId]);

  function togglePermission(permission: PermissionKey) {
    setSelectedPermissions((current) => {
      if (current.includes(permission)) {
        return current.filter((item) => item !== permission);
      }

      return [...current, permission];
    });
  }

  const sortedPermissions = useMemo(
    () => [...selectedPermissions].sort(),
    [selectedPermissions],
  );

  async function handleSavePermissions() {
    try {
      setSaving(true);
      setErrorMessage("");
      setSuccessMessage("");

      const response = await fetch(`/api/usuarios/${usuarioId}/permissoes`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ permissions: sortedPermissions }),
      });

      const result = (await response.json()) as {
        success: boolean;
        error?: { message?: string };
      };

      if (!response.ok || !result.success) {
        throw new Error(
          result.error?.message ?? "Nao foi possivel salvar permissoes",
        );
      }

      setSuccessMessage("Permissoes atualizadas com sucesso.");
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Erro ao salvar permissoes",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <Stack spacing={1.5} sx={{ mt: 1 }}>
      <Typography variant="h6" sx={{ fontWeight: 700 }}>
        Permissoes
      </Typography>

      <Typography variant="body2" color="text.secondary">
        As alteracoes entram em vigor no proximo login do usuario afetado.
      </Typography>

      {errorMessage && <Alert severity="error">{errorMessage}</Alert>}
      {successMessage && <Alert severity="success">{successMessage}</Alert>}

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 2 }}>
          <CircularProgress size={24} />
        </Box>
      ) : (
        <Stack spacing={1.5}>
          {Object.entries(PERMISSIONS_BY_MODULE).map(([moduleName, modulePermissions]) => (
            <Box key={moduleName}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.5 }}>
                {moduleName}
              </Typography>
              <Stack>
                {modulePermissions.map((permission) => (
                  <FormControlLabel
                    key={permission}
                    control={
                      <Checkbox
                        checked={selectedPermissions.includes(permission)}
                        disabled={readOnly}
                        onChange={() => togglePermission(permission)}
                      />
                    }
                    label={permissionLabels[permission]}
                  />
                ))}
              </Stack>
            </Box>
          ))}

          {!readOnly && (
            <Box>
              <Button
                variant="contained"
                disabled={saving}
                onClick={() => void handleSavePermissions()}
              >
                Salvar permissoes
              </Button>
            </Box>
          )}
        </Stack>
      )}
    </Stack>
  );
}
