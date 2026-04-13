import { Box, Button, Card, CardContent, Stack, Typography } from "@mui/material"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"

import { AuthenticatedShell } from "@/components/layout/authenticated-shell"
import { SESSION_COOKIE_NAME, verifySessionToken } from "@/lib/auth"

export default async function HomePage() {
  const cookieStore = await cookies()
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value

  if (!token) {
    redirect("/login")
  }

  const session = await verifySessionToken(token)

  if (!session) {
    redirect("/login")
  }

  return (
    <AuthenticatedShell user={{ nome: session.nome, email: session.email }}>
      <Card>
        <CardContent sx={{ p: { xs: 2.5, md: 4 } }}>
          <Stack spacing={2.5}>
            <Typography variant="h4" sx={{ fontWeight: 800 }}>
              Bem-vindo ao In-Siao
            </Typography>
            <Typography variant="body1" sx={{ maxWidth: 720, color: "text.secondary" }}>
              Este sistema existe para apoiar a Igreja Batista Siao no registro de visitantes,
              organizacao de dados ministeriais e automacao da comunicacao pastoral.
            </Typography>

            <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap", pt: 1 }}>
              <Button variant="contained" disabled>
                Cadastrar visitante
              </Button>
              <Button variant="outlined" disabled>
                Vincular numero a crianca para salinha
              </Button>
            </Box>
          </Stack>
        </CardContent>
      </Card>
    </AuthenticatedShell>
  )
}
