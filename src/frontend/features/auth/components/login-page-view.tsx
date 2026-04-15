"use client"

import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Stack,
  TextField,
  Typography
} from "@mui/material"
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
    <Box
      sx={{
        minHeight: "100vh",
        display: "grid",
        gridTemplateColumns: { xs: "1fr", md: "1.25fr 1.25fr 1fr" },
        background: "linear-gradient(140deg, #fff8f0 0%, #ffe3c4 100%)"
      }}
    >
      <Box
        sx={{
          gridColumn: { xs: "1", md: "1 / span 2" },
          display: { xs: "none", md: "flex" },
          alignItems: "center",
          justifyContent: "center",
          p: 8,
          background:
            "radial-gradient(circle at 20% 20%, rgba(255,106,0,0.25), transparent 35%), radial-gradient(circle at 80% 80%, rgba(0,0,0,0.12), transparent 45%), #101010",
          color: "#fff"
        }}
      >
        <Stack spacing={3} sx={{ maxWidth: 520 }}>
          <Typography variant="h3" sx={{ fontWeight: 800, lineHeight: 1.1 }}>
            Igreja Batista Siao
          </Typography>
          <Typography variant="h6" sx={{ color: "rgba(255,255,255,0.85)", fontWeight: 400 }}>
            Sistema de gestao ministerial para organizar visitantes, comunicacao e acompanhamento
            pastoral com seguranca.
          </Typography>
        </Stack>
      </Box>

      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          p: { xs: 2.5, md: 4 }
        }}
      >
        <Card sx={{ width: "100%", maxWidth: 420 }}>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
              Acesso ao sistema
            </Typography>
            <Typography variant="body2" sx={{ color: "text.secondary", mb: 2 }}>
              Entre com sua conta para continuar.
            </Typography>

            <Stack component="form" spacing={1.5} onSubmit={handleSubmit}>
              <TextField
                type="email"
                label="Email"
                value={values.email}
                onChange={(event) => updateValue("email", event.target.value)}
                required
                fullWidth
              />

              <TextField
                type="password"
                label="Senha"
                value={values.senha}
                onChange={(event) => updateValue("senha", event.target.value)}
                required
                fullWidth
              />

              {inviteSignUpSuccess && (
                <Alert severity="success">
                  Conta criada com sucesso. Faca login para continuar.
                </Alert>
              )}

              {errorMessage && <Alert severity="error">{errorMessage}</Alert>}

              <Button type="submit" size="large" variant="contained" disabled={loading} sx={{ mt: 1 }}>
                {loading ? <CircularProgress size={22} color="inherit" /> : "Entrar"}
              </Button>
            </Stack>
          </CardContent>
        </Card>
      </Box>
    </Box>
  )
}
