"use client";

import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type PerfilListItem = {
  id: string;
  nome: string;
  permissionsCount: number;
  usersCount: number;
};

export function PerfisListView() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [items, setItems] = useState<PerfilListItem[]>([]);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function loadItems() {
    try {
      setLoading(true);
      setErrorMessage("");

      const response = await fetch("/api/perfis");
      const result = (await response.json()) as {
        success: boolean;
        perfis?: PerfilListItem[];
        error?: { message?: string };
      };

      if (!response.ok || !result.perfis) {
        throw new Error(result.error?.message ?? "Nao foi possivel carregar perfis");
      }

      setItems(result.perfis);
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Erro ao carregar perfis",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadItems();
  }, []);

  async function handleConfirmDelete() {
    if (!deletingId) return;

    try {
      setDeleting(true);
      setErrorMessage("");

      const response = await fetch(`/api/perfis/${deletingId}`, {
        method: "DELETE",
      });

      const result = (await response.json()) as {
        success: boolean;
        error?: { message?: string };
      };

      if (!response.ok) {
        throw new Error(result.error?.message ?? "Nao foi possivel excluir perfil");
      }

      setDeleteDialogOpen(false);
      setDeletingId(null);
      await loadItems();
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Erro ao excluir perfil",
      );
    } finally {
      setDeleting(false);
    }
  }

  const deletingPerfil = items.find((item) => item.id === deletingId);

  return (
    <Stack spacing={2}>
      <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
        <Button variant="contained" onClick={() => router.push("/admin/perfis/novo")}>
          Novo perfil
        </Button>
      </Box>

      {errorMessage && <Alert severity="error">{errorMessage}</Alert>}

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Paper sx={{ width: "100%", overflowX: "auto" }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Nome</TableCell>
                  <TableCell>Permissoes</TableCell>
                  <TableCell>Usuarios</TableCell>
                  <TableCell align="right">Acoes</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>{item.nome}</TableCell>
                    <TableCell>{item.permissionsCount}</TableCell>
                    <TableCell>{item.usersCount}</TableCell>
                    <TableCell align="right">
                      <Stack direction="row" spacing={1} sx={{ justifyContent: "flex-end" }}>
                        <Button
                          size="small"
                          onClick={() => router.push(`/admin/perfis/${item.id}/editar`)}
                        >
                          Editar
                        </Button>
                        <Button
                          size="small"
                          color="error"
                          disabled={item.usersCount > 0}
                          onClick={() => {
                            setDeletingId(item.id);
                            setDeleteDialogOpen(true);
                          }}
                        >
                          Excluir
                        </Button>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}

                {items.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4}>
                      <Typography color="text.secondary">
                        Nenhum perfil cadastrado.
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}

      <Dialog
        open={deleteDialogOpen}
        onClose={() => {
          if (!deleting) {
            setDeleteDialogOpen(false);
            setDeletingId(null);
          }
        }}
      >
        <DialogTitle>Excluir perfil</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Tem certeza que deseja excluir o perfil{" "}
            <strong>{deletingPerfil?.nome}</strong>? Esta acao nao pode ser desfeita.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            disabled={deleting}
            onClick={() => {
              setDeleteDialogOpen(false);
              setDeletingId(null);
            }}
          >
            Cancelar
          </Button>
          <Button
            color="error"
            disabled={deleting}
            onClick={() => void handleConfirmDelete()}
          >
            Excluir
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}
