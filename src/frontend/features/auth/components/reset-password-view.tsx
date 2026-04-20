"use client"

import { Alert, Box, Button, CircularProgress, Stack, Typography } from "@mui/material"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { FormEvent, useEffect, useState } from "react"

import { PasswordField } from "@/frontend/components/inputs/password-field"
import { PasswordRulesChecklist } from "@/frontend/features/auth/components/password-rules-checklist"

export function ResetPasswordView() {
  const router = useRouter()
  const [token, setToken] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")
  const [noToken, setNoToken] = useState(false)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const t = params.get("token") ?? ""
    if (!t) {
      setNoToken(true)
    } else {
      setToken(t)
    }
  }, [])

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setErrorMessage("")

    if (password !== confirmPassword) {
      setErrorMessage("As senhas não coincidem.")
      return
    }

    setLoading(true)

    try {
      const response = await fetch("/api/auth/password-reset/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password, confirmPassword })
      })

      const result = (await response.json()) as {
        success: boolean
        error?: { message?: string }
      }

      if (!response.ok) {
        throw new Error(result.error?.message ?? "Erro ao redefinir senha.")
      }

      router.push("/login?status=password-reset-success")
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Erro ao redefinir senha.")
    } finally {
      setLoading(false)
    }
  }

  if (noToken) {
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
          <Alert severity="error" sx={{ mb: 3 }}>
            Link inválido ou expirado. Solicite um novo link de recuperação.
          </Alert>
          <Link href="/esqueci-minha-senha" style={{ textDecoration: "none" }}>
            <Button variant="contained" fullWidth>
              Solicitar novo link
            </Button>
          </Link>
        </Box>
      </Box>
    )
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
          Redefinir senha
        </Typography>
        <Typography variant="body2" sx={{ color: "text.secondary", mb: 4, lineHeight: 1.6 }}>
          Defina sua nova senha para acessar o portal Sião.
        </Typography>

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
                NOVA SENHA
              </Typography>
              <PasswordField
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                fullWidth
                size="small"
              />
            </Box>

            <PasswordRulesChecklist password={password} />

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
                CONFIRMAR NOVA SENHA
              </Typography>
              <PasswordField
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
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
              {loading ? <CircularProgress size={22} color="inherit" /> : "REDEFINIR SENHA →"}
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
      </Box>
    </Box>
  )
}
