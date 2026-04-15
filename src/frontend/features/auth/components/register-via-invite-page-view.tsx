"use client";

import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";

import { PasswordRulesChecklist } from "@/frontend/features/auth/components/password-rules-checklist";

type RegisterViaInvitePageViewProps = {
  token: string | null;
};

type FormValues = {
  nome: string;
  sobrenome: string;
  email: string;
  senha: string;
};

const initialValues: FormValues = {
  nome: "",
  sobrenome: "",
  email: "",
  senha: "",
};

export function RegisterViaInvitePageView({ token }: RegisterViaInvitePageViewProps) {
  const router = useRouter();
  const [isTokenLoading, setIsTokenLoading] = useState(true);
  const [tokenValid, setTokenValid] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [values, setValues] = useState<FormValues>(initialValues);

  useEffect(() => {
    async function validateToken() {
      if (!token) {
        setTokenValid(false);
        setIsTokenLoading(false);
        return;
      }

      try {
        const response = await fetch(
          `/api/auth/convite/validate?token=${encodeURIComponent(token)}`,
        );
        const result = (await response.json()) as { valid?: boolean };

        setTokenValid(Boolean(result.valid));
      } catch {
        setTokenValid(false);
      } finally {
        setIsTokenLoading(false);
      }
    }

    void validateToken();
  }, [token]);

  function updateValue<K extends keyof FormValues>(
    key: K,
    value: FormValues[K],
  ) {
    setValues((current) => ({
      ...current,
      [key]: value,
    }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!token) {
      setErrorMessage("Link invalido ou ja utilizado");
      return;
    }

    try {
      setLoading(true);
      setErrorMessage("");

      const response = await fetch("/api/auth/sign-up", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nome: values.nome,
          sobrenome: values.sobrenome,
          email: values.email,
          senha: values.senha,
          token,
        }),
      });

      const result = (await response.json()) as {
        success: boolean;
        error?: { message?: string };
      };

      if (!response.ok) {
        throw new Error(result.error?.message ?? "Nao foi possivel criar conta");
      }

      router.push("/login?status=invite-sign-up-success");
      router.refresh();
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Erro ao criar conta",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        p: 2,
        background:
          "linear-gradient(130deg, #f9f5ef 0%, #f3dcbc 55%, #f8efe2 100%)",
      }}
    >
      <Card sx={{ width: "100%", maxWidth: 520 }}>
        <CardContent sx={{ p: 3 }}>
          <Stack spacing={2}>
            <Typography variant="h5" sx={{ fontWeight: 700 }}>
              Criar conta por convite
            </Typography>

            {isTokenLoading ? (
              <Box sx={{ display: "flex", justifyContent: "center", py: 2 }}>
                <CircularProgress />
              </Box>
            ) : null}

            {!isTokenLoading && !tokenValid ? (
              <Alert severity="error">
                Link invalido ou ja utilizado. Solicite um novo convite ao administrador.
              </Alert>
            ) : null}

            {!isTokenLoading && tokenValid ? (
              <Stack component="form" spacing={1.5} onSubmit={handleSubmit}>
                <TextField
                  label="Nome"
                  value={values.nome}
                  onChange={(event) => updateValue("nome", event.target.value)}
                  required
                  fullWidth
                />
                <TextField
                  label="Sobrenome"
                  value={values.sobrenome}
                  onChange={(event) => updateValue("sobrenome", event.target.value)}
                  required
                  fullWidth
                />
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

                <PasswordRulesChecklist password={values.senha} />

                {errorMessage && <Alert severity="error">{errorMessage}</Alert>}

                <Button type="submit" variant="contained" size="large" disabled={loading}>
                  {loading ? (
                    <CircularProgress size={22} color="inherit" />
                  ) : (
                    "Criar conta"
                  )}
                </Button>
              </Stack>
            ) : null}
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
}
