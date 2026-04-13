import { Box, Button, Card, CardContent, Stack, Typography } from "@mui/material"
import Link from "next/link"

export function HomePageView() {
  return (
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
            <Link href="/visitantes/novo" style={{ textDecoration: "none" }}>
              <Button variant="contained">Cadastrar visitante</Button>
            </Link>
            <Button variant="outlined" disabled>
              Vincular numero a crianca para salinha
            </Button>
          </Box>
        </Stack>
      </CardContent>
    </Card>
  )
}
