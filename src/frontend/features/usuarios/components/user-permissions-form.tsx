"use client";

import {
  Alert,
  Box,
  Button,
  Checkbox,
  CircularProgress,
  Divider,
  FormControlLabel,
  Stack,
  Typography,
} from "@mui/material";
import { useEffect, useMemo, useState } from "react";

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

type AssignedProfile = {
  id: string;
  nome: string;
  permissions: PermissionKey[];
};

type UserPermissionsFormProps = {
  usuarioId: string;
  readOnly?: boolean;
};

export function UserPermissionsForm({
  usuarioId,
  readOnly = false,
}: UserPermissionsFormProps) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [availableProfiles, setAvailableProfiles] = useState<AssignedProfile[]>([]);
  const [selectedProfileIds, setSelectedProfileIds] = useState<string[]>([]);
  const [manualPermissions, setManualPermissions] = useState<PermissionKey[]>([]);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        setErrorMessage("");

        const [permissionsRes, perfisRes] = await Promise.all([
          fetch(`/api/usuarios/${usuarioId}/permissoes`),
          fetch("/api/perfis"),
        ]);

        const permissionsResult = (await permissionsRes.json()) as {
          success: boolean;
          assignedProfiles?: AssignedProfile[];
          manualPermissions?: PermissionKey[];
          error?: { message?: string };
        };

        const perfisResult = (await perfisRes.json()) as {
          success: boolean;
          perfis?: { id: string; nome: string; permissionsCount: number; usersCount: number }[];
          error?: { message?: string };
        };

        if (!permissionsRes.ok) {
          throw new Error(
            permissionsResult.error?.message ?? "Nao foi possivel carregar permissoes",
          );
        }

        if (!perfisRes.ok) {
          throw new Error(
            perfisResult.error?.message ?? "Nao foi possivel carregar perfis",
          );
        }

        const assigned = permissionsResult.assignedProfiles ?? [];
        const manual = permissionsResult.manualPermissions ?? [];
        const perfisListados = perfisResult.perfis ?? [];

        setSelectedProfileIds(assigned.map((p) => p.id));
        setManualPermissions(manual);

        const assignedWithPermissions = assigned;
        const allProfileIds = new Set(assigned.map((p) => p.id));
        const extraProfiles = perfisListados
          .filter((p) => !allProfileIds.has(p.id))
          .map((p) => ({ id: p.id, nome: p.nome, permissions: [] as PermissionKey[] }));

        setAvailableProfiles([...assignedWithPermissions, ...extraProfiles]);
      } catch (error) {
        setErrorMessage(
          error instanceof Error ? error.message : "Erro ao carregar permissoes",
        );
      } finally {
        setLoading(false);
      }
    }

    void loadData();
  }, [usuarioId]);

  const permissionsFromProfiles = useMemo<Set<PermissionKey>>(() => {
    const set = new Set<PermissionKey>();
    for (const profile of availableProfiles) {
      if (selectedProfileIds.includes(profile.id)) {
        for (const perm of profile.permissions) {
          set.add(perm);
        }
      }
    }
    return set;
  }, [availableProfiles, selectedProfileIds]);

  function toggleProfile(profileId: string) {
    setSelectedProfileIds((current) =>
      current.includes(profileId)
        ? current.filter((id) => id !== profileId)
        : [...current, profileId],
    );
  }

  function toggleManualPermission(permission: PermissionKey) {
    if (permissionsFromProfiles.has(permission)) return;
    setManualPermissions((current) =>
      current.includes(permission)
        ? current.filter((p) => p !== permission)
        : [...current, permission],
    );
  }

  async function handleSave() {
    try {
      setSaving(true);
      setErrorMessage("");
      setSuccessMessage("");

      const response = await fetch(`/api/usuarios/${usuarioId}/permissoes`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          profileIds: selectedProfileIds,
          permissions: manualPermissions,
        }),
      });

      const result = (await response.json()) as {
        success: boolean;
        error?: { message?: string };
      };

      if (!response.ok || !result.success) {
        throw new Error(result.error?.message ?? "Nao foi possivel salvar permissoes");
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

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
        <CircularProgress size={24} />
      </Box>
    );
  }

  return (
    <Stack spacing={2}>
      {errorMessage && <Alert severity="error">{errorMessage}</Alert>}
      {successMessage && <Alert severity="success">{successMessage}</Alert>}

      <Box>
        <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>
          Perfis
        </Typography>
        {availableProfiles.length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            Nenhum perfil cadastrado.
          </Typography>
        ) : (
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0 }}>
            {availableProfiles.map((profile) => (
              <FormControlLabel
                key={profile.id}
                sx={{
                  m: 0,
                  flex: { xs: "1 1 100%", sm: "1 1 calc(50% - 8px)", md: "1 1 calc(33.333% - 8px)" },
                }}
                control={
                  <Checkbox
                    checked={selectedProfileIds.includes(profile.id)}
                    disabled={readOnly}
                    onChange={() => toggleProfile(profile.id)}
                  />
                }
                label={profile.nome}
              />
            ))}
          </Box>
        )}
      </Box>

      <Divider />

      <Box>
        <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 0.5 }}>
          Permissoes individuais
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
          Permissoes marcadas automaticamente pelo perfil nao podem ser desmarcadas aqui.
        </Typography>
        <Stack spacing={2}>
          {Object.entries(PERMISSIONS_BY_MODULE).map(([moduleName, modulePermissions]) => (
            <Box key={moduleName}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.5 }}>
                {moduleName}
              </Typography>
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0 }}>
                {modulePermissions.map((permission) => {
                  const fromProfile = permissionsFromProfiles.has(permission);
                  const checked = fromProfile || manualPermissions.includes(permission);
                  return (
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
                          checked={checked}
                          disabled={readOnly || fromProfile}
                          onChange={() => toggleManualPermission(permission)}
                        />
                      }
                      label={
                        <Typography
                          variant="body2"
                          color={fromProfile ? "text.secondary" : "text.primary"}
                        >
                          {permissionLabels[permission]}
                          {fromProfile && " (perfil)"}
                        </Typography>
                      }
                    />
                  );
                })}
              </Box>
            </Box>
          ))}
        </Stack>
      </Box>

      {!readOnly && (
        <Box>
          <Button
            variant="contained"
            disabled={saving}
            onClick={() => void handleSave()}
          >
            Salvar permissoes
          </Button>
        </Box>
      )}
    </Stack>
  );
}
