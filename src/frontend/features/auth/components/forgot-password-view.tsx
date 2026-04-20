"use client"

import { Alert, Box, Button, CircularProgress, Stack, TextField, Typography } from "@mui/material"
import Link from "next/link"
import { FormEvent, useState } from "react"

export function ForgotPasswordView() {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setErrorMessage("")
    setLoading(true)

    try {
      const response = await fetch("/api/auth/password-reset/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
      })

      if (response.status === 429) {
        const result = (await response.json()) as { error?: { message?: string } }
        throw new Error(result.error?.message ?? "Muitas tentativas. Tente novamente mais tarde.")
      }

      if (!response.ok) {
        const result = (await response.json()) as { error?: { message?: string } }
        throw new Error(result.error?.message ?? "Erro ao processar solicitação.")
      }

      setSuccess(true)
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Erro ao processar solicitação.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box sx={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", bgcolor: "background.default" }}>
      <Box
        sx={{
          width: { xs: "100%", sm: "420px" },
          bgcolor: "background.paper",
          px: { xs: 3, sm: 5 },
          py: 6,
          borderRadius: { sm: 2 },
          boxShadow: { sm: "0 2px 16px rgba(0,0,0,0.08)" }
        }}
      >
        <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.75 }}>
          Esqueci minha senha
        </Typography>
        <Typography variant="body2" sx={{ color: "text.secondary", mb: 4, lineHeight: 1.6 }}>
          Informe seu e-mail cadastrado e enviaremos um link para redefinir sua senha.
        </Typography>

        {success ? (
          <Stack spacing={3}>
            <Alert severity="success">
              Se o e-mail estiver cadastrado, você receberá um link de recuperação em breve.
            </Alert>
            <Link href="/login" style={{ textDecoration: "none" }}>
              <Button variant="outlined" fullWidth>
                Voltar para o login
              </Button>
            </Link>
          </Stack>
        ) : (
          <Box component="form" onSubmit={handleSubmit}>
            <Stack spacing={2.5}>
              <Box>
                <Typography
                  variant="caption"
                  sx={{
                    display: "block",
                    fontWeight: 600,
                    letterSpacing: "0.08em",
                    color: "text.secondary",
                    mb: 0.75
                  }}
                >
                  E-MAIL
                </Typography>
                <TextField
                  type="email"
                  placeholder="nome@igrejasiao.org.br"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  fullWidth
                  size="small"
                />
              </Box>

              {errorMessage && <Alert severity="error">{errorMessage}</Alert>}

              <Button
                type="submit"
                variant="contained"
                size="large"
                disabled={loading}
                fullWidth
                sx={{ mt: 0.5, py: 1.4, fontSize: "0.875rem", letterSpacing: "0.08em" }}
              >
                {loading ? <CircularProgress size={22} color="inherit" /> : "ENVIAR LINK →"}
              </Button>

              <Box sx={{ textAlign: "center" }}>
                <Link href="/login" style={{ textDecoration: "none" }}>
                  <Typography variant="caption" sx={{ color: "text.secondary", "&:hover": { color: "primary.main" } }}>
                    ← Voltar para o login
                  </Typography>
                </Link>
              </Box>
            </Stack>
          </Box>
        )}
      </Box>
    </Box>
  )
}
