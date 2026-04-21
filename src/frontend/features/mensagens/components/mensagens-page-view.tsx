"use client";

import { useEffect, useState } from "react";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import {
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  Stack,
  Typography,
} from "@mui/material";
import { MessageTemplateForm } from "@/frontend/features/mensagens/components/message-template-form";
import { DeleteTemplateDialog } from "@/frontend/features/mensagens/components/delete-template-dialog";

type Template = {
  id: string;
  title: string;
  body: string;
  order: number;
};

function sortByOrder(items: Template[]) {
  return [...items].sort((a, b) => a.order - b.order);
}

export function MensagensPageView() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const [createOpen, setCreateOpen] = useState(false);
  const [creating, setCreating] = useState(false);

  const [editTarget, setEditTarget] = useState<Template | null>(null);
  const [updating, setUpdating] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState<Template | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    void loadTemplates();
  }, []);

  async function loadTemplates() {
    try {
      setLoading(true);
      setErrorMessage("");
      const res = await fetch("/api/mensagens");
      if (!res.ok) throw new Error("Não foi possível carregar templates");
      const data = (await res.json()) as Template[];
      setTemplates(sortByOrder(data));
    } catch (err) {
      setErrorMessage(
        err instanceof Error ? err.message : "Erro ao carregar templates",
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate(data: { title: string; body: string }) {
    try {
      setCreating(true);
      setErrorMessage("");
      const res = await fetch("/api/mensagens", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Não foi possível criar template");
      const created = (await res.json()) as Template;
      setTemplates((prev) => sortByOrder([...prev, created]));
      setCreateOpen(false);
    } catch (err) {
      setErrorMessage(
        err instanceof Error ? err.message : "Erro ao criar template",
      );
    } finally {
      setCreating(false);
    }
  }

  async function handleUpdate(data: {
    title: string;
    body: string;
    order?: number;
  }) {
    if (!editTarget) return;
    try {
      setUpdating(true);
      setErrorMessage("");
      const res = await fetch(`/api/mensagens/${editTarget.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Não foi possível atualizar template");
      const updated = (await res.json()) as Template;
      setTemplates((prev) =>
        sortByOrder(prev.map((t) => (t.id === updated.id ? updated : t))),
      );
      setEditTarget(null);
    } catch (err) {
      setErrorMessage(
        err instanceof Error ? err.message : "Erro ao atualizar template",
      );
    } finally {
      setUpdating(false);
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    try {
      setDeleting(true);
      setErrorMessage("");
      const res = await fetch(`/api/mensagens/${deleteTarget.id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Não foi possível excluir template");
      setTemplates((prev) =>
        sortByOrder(prev.filter((t) => t.id !== deleteTarget.id)),
      );
      setDeleteTarget(null);
    } catch (err) {
      setErrorMessage(
        err instanceof Error ? err.message : "Erro ao excluir template",
      );
      setDeleteTarget(null);
    } finally {
      setDeleting(false);
    }
  }

  return (
    <Stack spacing={3}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setCreateOpen(true)}
        >
          Adicionar template
        </Button>
      </Box>

      {errorMessage && (
        <Typography color="error" variant="body2">
          {errorMessage}
        </Typography>
      )}

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Stack spacing={1.5}>
          {templates.length === 0 && (
            <Typography color="text.secondary">
              Nenhum template cadastrado ainda.
            </Typography>
          )}
          {templates.map((template) => (
            <Card key={template.id}>
              <CardContent>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    gap: 1,
                  }}
                >
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography
                      variant="subtitle2"
                      color="text.secondary"
                      gutterBottom
                    >
                      Ordem #{template.order}
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>
                      {template.title}
                    </Typography>
                    <Divider sx={{ my: 1 }} />
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}
                    >
                      {template.body}
                    </Typography>
                  </Box>
                  <Box sx={{ display: "flex", flexShrink: 0 }}>
                    <IconButton
                      size="small"
                      onClick={() => setEditTarget(template)}
                      aria-label="editar"
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => setDeleteTarget(template)}
                      aria-label="excluir"
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          ))}
        </Stack>
      )}

      {/* Dialog criar */}
      <Dialog
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Novo template</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <MessageTemplateForm
            loading={creating}
            onSubmit={(data) => void handleCreate(data)}
            onCancel={() => setCreateOpen(false)}
            submitLabel="Criar"
          />
        </DialogContent>
      </Dialog>

      {/* Dialog editar */}
      <Dialog
        open={Boolean(editTarget)}
        onClose={() => setEditTarget(null)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Editar template</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          {editTarget && (
            <MessageTemplateForm
              initial={{
                title: editTarget.title,
                body: editTarget.body,
                order: editTarget.order,
              }}
              showOrderField
              loading={updating}
              onSubmit={(data) => void handleUpdate(data)}
              onCancel={() => setEditTarget(null)}
              submitLabel="Salvar"
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Dialog excluir */}
      <DeleteTemplateDialog
        open={Boolean(deleteTarget)}
        templateTitle={deleteTarget?.title ?? ""}
        deleting={deleting}
        onConfirm={() => void handleDelete()}
        onClose={() => setDeleteTarget(null)}
      />
    </Stack>
  );
}
