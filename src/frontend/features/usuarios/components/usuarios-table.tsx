"use client";

import { DeleteUsuarioDialog } from "@/frontend/features/usuarios/components/delete-usuario-dialog";
import { GenerateInviteDialog } from "@/frontend/features/usuarios/components/generate-invite-dialog";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  Typography,
} from "@mui/material";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

type UsuarioListItem = {
  id: string;
  nome: string;
  sobrenome: string;
  email: string;
  role: "ADMIN" | "STAFF";
  status: "ATIVO" | "INATIVO";
  deletedAt: string | null;
  createdAt: string;
};

type UsuariosTableProps = {
  currentUserId: string;
};

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(value));
}

export function UsuariosTable({ currentUserId }: UsuariosTableProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [items, setItems] = useState<UsuarioListItem[]>([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [generateInviteDialogOpen, setGenerateInviteDialogOpen] =
    useState(false);

  async function loadItems() {
    try {
      setLoading(true);
      setErrorMessage("");

      const response = await fetch("/api/usuarios");
      const result = (await response.json()) as {
        success: boolean;
        usuarios?: UsuarioListItem[];
        error?: { message?: string };
      };

      if (!response.ok || !result.usuarios) {
        throw new Error(
          result.error?.message ?? "Nao foi possivel carregar usuarios",
        );
      }

      setItems(result.usuarios);
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Erro ao carregar usuarios",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadItems();
  }, []);

  const paginatedItems = useMemo(() => {
    const start = page * rowsPerPage;
    return items.slice(start, start + rowsPerPage);
  }, [items, page, rowsPerPage]);

  const deletingUser = items.find((item) => item.id === deletingId);

  async function handleConfirmDelete() {
    if (!deletingId) {
      return;
    }

    try {
      setErrorMessage("");

      const response = await fetch(`/api/usuarios/${deletingId}`, {
        method: "DELETE",
      });

      const result = (await response.json()) as {
        success: boolean;
        error?: { message?: string };
      };

      if (!response.ok) {
        throw new Error(
          result.error?.message ?? "Nao foi possivel inativar usuario",
        );
      }

      setDeleteDialogOpen(false);
      setDeletingId(null);
      await loadItems();
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Erro ao inativar usuario",
      );
    }
  }

  function handleOpenUsuarioDetails(usuarioId: string) {
    router.push(`/admin/usuarios/${usuarioId}`);
  }

  return (
    <Stack spacing={2}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 1.5,
        }}
      >
        <Typography variant="h4" sx={{ fontWeight: 800 }}>
          Usuarios
        </Typography>
        <Button
          variant="contained"
          onClick={() => setGenerateInviteDialogOpen(true)}
        >
          Gerar convite
        </Button>
      </Box>

      {errorMessage && <Alert severity="error">{errorMessage}</Alert>}

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Paper sx={{ width: "100%", overflowX: "auto" }}>
          <TableContainer
            sx={{
              width: "100%",
              overflowX: "auto",
              WebkitOverflowScrolling: "touch",
              "& table": { minWidth: 760 },
            }}
          >
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Nome</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Role</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Criado em</TableCell>
                  <TableCell align="right">Acoes</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedItems.map((item) => (
                  <TableRow
                    key={item.id}
                    hover
                    onClick={() => handleOpenUsuarioDetails(item.id)}
                    sx={{ cursor: "pointer" }}
                  >
                    <TableCell>{`${item.nome} ${item.sobrenome}`}</TableCell>
                    <TableCell>{item.email}</TableCell>
                    <TableCell>{item.role}</TableCell>
                    <TableCell>
                      <Chip
                        size="small"
                        label={item.status === "ATIVO" ? "Ativo" : "Inativo"}
                        color={item.status === "ATIVO" ? "success" : "default"}
                      />
                    </TableCell>
                    <TableCell>{formatDateTime(item.createdAt)}</TableCell>
                    <TableCell align="right">
                      <Stack
                        direction="row"
                        spacing={1}
                        sx={{ justifyContent: "flex-end" }}
                      >
                        <Button
                          size="small"
                          onClick={(event) => {
                            event.stopPropagation();
                            handleOpenUsuarioDetails(item.id);
                          }}
                        >
                          Visualizar
                        </Button>
                        <Button
                          size="small"
                          onClick={(event) => {
                            event.stopPropagation();
                            router.push(`/admin/usuarios/${item.id}/editar`);
                          }}
                        >
                          Editar
                        </Button>
                        <Button
                          size="small"
                          color="error"
                          disabled={
                            item.id === currentUserId ||
                            item.status === "INATIVO"
                          }
                          onClick={(event) => {
                            event.stopPropagation();
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

                {paginatedItems.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6}>
                      <Typography color="text.secondary">
                        Nenhum usuario cadastrado.
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            component="div"
            rowsPerPageOptions={[5, 10, 25]}
            count={items.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={(_, value) => setPage(value)}
            onRowsPerPageChange={(event) => {
              setRowsPerPage(Number(event.target.value));
              setPage(0);
            }}
          />
        </Paper>
      )}

      <DeleteUsuarioDialog
        open={deleteDialogOpen}
        loading={false}
        usuarioNome={
          deletingUser ? `${deletingUser.nome} ${deletingUser.sobrenome}` : ""
        }
        onCancel={() => {
          setDeleteDialogOpen(false);
          setDeletingId(null);
        }}
        onConfirm={() => void handleConfirmDelete()}
      />

      <GenerateInviteDialog
        open={generateInviteDialogOpen}
        onClose={() => setGenerateInviteDialogOpen(false)}
      />
    </Stack>
  );
}
