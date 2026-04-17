"use client"

import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Stack,
  TextField,
  Typography
} from "@mui/material"
import { PasswordField } from "@/frontend/components/inputs/password-field"
import { useRouter } from "next/navigation"
import { FormEvent, useEffect, useState } from "react"

type FormValues = {
  email: string
  senha: string
}

const initialValues: FormValues = {
  email: "",
  senha: ""
}

export function LoginPageView() {
  const router = useRouter()
  const [values, setValues] = useState<FormValues>(initialValues)
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")
  const [inviteSignUpSuccess, setInviteSignUpSuccess] = useState(false)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    setInviteSignUpSuccess(params.get("status") === "invite-sign-up-success")
  }, [])

  function updateValue<K extends keyof FormValues>(key: K, value: FormValues[K]) {
    setValues((current) => ({
      ...current,
      [key]: value
    }))
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setErrorMessage("")
    setLoading(true)

    try {
      const signInResponse = await fetch("/api/auth/sign-in", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: values.email,
          senha: values.senha
        })
      })

      const signInResult = (await signInResponse.json()) as {
        success: boolean
        error?: { message?: string }
      }

      if (!signInResponse.ok) {
        throw new Error(signInResult.error?.message ?? "Credenciais invalidas")
      }

      router.push("/")
      router.refresh()
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Erro ao autenticar")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box sx={{ minHeight: "100vh", display: "flex" }}>

      {/* ── Painel esquerdo: imagem de fundo ── */}
      <Box
        sx={{
          flex: 1,
          display: { xs: "none", md: "flex" },
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          backgroundImage: "url(/images/church-bg-login.png)",
          backgroundSize: "cover",
          backgroundPosition: "center",
          "&::before": {
            content: '""',
            position: "absolute",
            inset: 0,
            background: "rgba(0,0,0,0.52)"
          }
        }}
      >
        {/* Conteúdo central */}
        <Stack
          spacing={2}
          sx={{ position: "relative", zIndex: 1, textAlign: "center", px: 5, alignItems: "center" }}
        >
          <Box
            component="img"
            src="/images/logo-siao-branco-sem-fundo.png"
            alt="Logo Sião"
            sx={{ width: 600, height: 600, objectFit: "contain" }}
          />

          <Box style={{ marginTop: '-150px' }} sx={{display:'flex', flexDirection:'column', alignItems:'center'}}>
            <Typography
              sx={{
                color: "rgba(255,255,255,0.75)",
                letterSpacing: "0.2em",
                fontSize: "2rem",
                textTransform: "uppercase",
                mt: 0.5
              }}
            >
              Igreja Batista Sião MARINGA
            </Typography>
            <Typography
              variant="body2"
              sx={{
                color: "rgba(255,255,255,0.65)",
                fontStyle: "italic",
                mt: 1.5,
                lineHeight: 1.7,
                fontSize: "2rem"
              }}
            >
              &ldquo;Um ambiente sagrado para a gestão da nossa comunidade.&rdquo;
            </Typography>
          </Box>

        </Stack>

        {/* Rodapé esquerdo */}
        <Typography
          variant="caption"
          sx={{
            position: "absolute",
            bottom: 24,
            left: 28,
            zIndex: 1,
            color: "rgba(255,255,255,0.35)",
            letterSpacing: "0.1em",
            fontSize: "0.65rem"
          }}
        >
          © GESTÃO DIGITAL CERTIFICADA
        </Typography>
      </Box>

      {/* ── Painel direito: formulário ── */}
      <Box
        sx={{
          width: { xs: "100%", md: "420px" },
          flexShrink: 0,
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          bgcolor: "background.paper",
          px: { xs: 3, sm: 5 },
          py: { xs: 5, md: 6 }
        }}
      >
        {/* Formulário */}
        <Box sx={{ my: "auto" }}>
          <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.75 }}>
            Acesso ao sistema
          </Typography>
          <Typography variant="body2" sx={{ color: "text.secondary", mb: 4, lineHeight: 1.6 }}>
            Entre com suas credenciais para gerenciar o portal Sião.
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
                E-MAIL
              </Typography>
              <TextField
                type="email"
                placeholder="nome@igrejasiao.org.br"
                value={values.email}
                onChange={(event) => updateValue("email", event.target.value)}
                required
                fullWidth
                size="small"
              />
            </Box>

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
                SUA SENHA
              </Typography>
              <PasswordField
                placeholder="••••••••"
                value={values.senha}
                onChange={(event) => updateValue("senha", event.target.value)}
                required
                fullWidth
                size="small"
              />
            </Box>

            {inviteSignUpSuccess && (
              <Alert severity="success">
                Conta criada com sucesso. Faça login para continuar.
              </Alert>
            )}

            {errorMessage && (
              <Alert severity="error">{errorMessage}</Alert>
            )}

            <Button
              type="submit"
              variant="contained"
              size="large"
              disabled={loading}
              fullWidth
              sx={{ mt: 0.5, py: 1.4, fontSize: "0.875rem", letterSpacing: "0.08em" }}
            >
              {loading
                ? <CircularProgress size={22} color="inherit" />
                : "ENTRAR →"}
            </Button>
          </Stack>
          </Box>
        </Box>

        {/* Rodapé direito */}
        <Box>
          {/* <Typography
            component="a"
            href="mailto:ti@igrejasiao.org.br"
            variant="caption"
            sx={{
              display: "block",
              color: "text.secondary",
              letterSpacing: "0.08em",
              textDecoration: "none",
              mb: 1.5,
              "&:hover": { color: "primary.main" }
            }}
          >
            ↑ CONTATAR SUPORTE TI
          </Typography> */}

          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              borderTop: "1px solid",
              borderColor: "divider",
              pt: 1.5
            }}
          >
            <Typography variant="caption" sx={{ color: "text.disabled", letterSpacing: "0.06em" }}>
              PRIVACIDADE
            </Typography>
            <Typography variant="caption" sx={{ color: "text.disabled" }}>
              © 2026
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  )
}
