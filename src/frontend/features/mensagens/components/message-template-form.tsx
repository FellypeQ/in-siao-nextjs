"use client"

import { useState } from "react"
import { Box, Button, CircularProgress, Stack, TextField } from "@mui/material"

type FormValues = {
  title: string
  body: string
  order?: number
}

type MessageTemplateFormProps = {
  initial?: FormValues
  loading?: boolean
  showOrderField?: boolean
  onSubmit: (data: FormValues) => void
  onCancel: () => void
  submitLabel?: string
}

export function MessageTemplateForm({
  initial,
  loading = false,
  showOrderField = false,
  onSubmit,
  onCancel,
  submitLabel = "Salvar",
}: MessageTemplateFormProps) {
  const [title, setTitle] = useState(initial?.title ?? "")
  const [body, setBody] = useState(initial?.body ?? "")
  const [order, setOrder] = useState<number | "">(initial?.order ?? "")
  const [errors, setErrors] = useState<{ title?: string; body?: string; order?: string }>({})

  function validate(): boolean {
    const next: { title?: string; body?: string; order?: string } = {}
    if (!title.trim()) next.title = "Título obrigatório"
    if (!body.trim()) next.body = "Corpo obrigatório"
    if (body.length > 4000) next.body = "Corpo: máximo 4000 caracteres"
    if (title.includes("\uFFFD")) {
      next.title = "Titulo contem caractere invalido (�). Cole novamente o emoji."
    }
    if (body.includes("\uFFFD")) {
      next.body = "Corpo contem caractere invalido (�). Cole novamente os emojis."
    }
    if (showOrderField && (order === "" || !Number.isInteger(order) || order <= 0)) {
      next.order = "Ordem deve ser um inteiro positivo"
    }
    setErrors(next)
    return Object.keys(next).length === 0
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) return
    onSubmit({
      title: title.trim(),
      body: body.trim(),
      ...(showOrderField && order !== "" ? { order } : {}),
    })
  }

  return (
    <Box component="form" onSubmit={handleSubmit} noValidate>
      <Stack spacing={2}>
        <TextField
          label="Título"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          error={Boolean(errors.title)}
          helperText={errors.title}
          fullWidth
          required
          slotProps={{ htmlInput: { maxLength: 100 } }}
        />
        <TextField
          label="Corpo da mensagem"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          error={Boolean(errors.body)}
          helperText={errors.body ?? `${body.length}/4000`}
          fullWidth
          required
          multiline
          minRows={6}
          slotProps={{ htmlInput: { maxLength: 4000 } }}
          placeholder="Use {nome_do_visitante} para inserir o primeiro nome do visitante"
        />
        {showOrderField && (
          <TextField
            label="Ordem"
            type="number"
            value={order}
            onChange={(e) => setOrder(e.target.value === "" ? "" : Number(e.target.value))}
            error={Boolean(errors.order)}
            helperText={errors.order}
            fullWidth
            required
            slotProps={{ htmlInput: { min: 1, step: 1 } }}
          />
        )}
        <Box sx={{ display: "flex", gap: 1, justifyContent: "flex-end" }}>
          <Button onClick={onCancel} disabled={loading}>
            Cancelar
          </Button>
          <Button type="submit" variant="contained" disabled={loading}>
            {loading ? <CircularProgress size={20} color="inherit" /> : submitLabel}
          </Button>
        </Box>
      </Stack>
    </Box>
  )
}
