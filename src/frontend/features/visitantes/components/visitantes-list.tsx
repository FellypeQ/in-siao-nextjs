"use client"

import {
  Box,
  Button,
  Card,
  CardActionArea,
  CardContent,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Pagination,
  Stack,
  Typography
} from "@mui/material"
import {
  translateActualChurch,
  translateHowKnow,
  translateRelationshipType
} from "@/frontend/features/visitantes/constants/visitante-enum-translations"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

type VisitanteListItem = {
  id: string
  name: string
  birthDate: string
  phone: string | null
  createdAt: string
}

type VisitanteDetail = {
  member: {
    id: string
    name: string
    birthDate: string
    phone: string | null
    baptized: boolean
    createdAt: string
  }
  visitorProfile: {
    actualChurch: string
    howKnow: string
    howKnowOtherAnswer: string | null
  }
  prayers: Array<{
    id: string
    text: string
  }>
  familyRelationships: Array<{
    id: string
    relationshipType: string
    relatedMember: {
      id: string
      name: string
      birthDate: string
      phone: string | null
    }
  }>
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short"
  }).format(new Date(date))
}

export function VisitantesList() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [items, setItems] = useState<VisitanteListItem[]>([])
  const [totalPages, setTotalPages] = useState(1)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [selected, setSelected] = useState<VisitanteDetail | null>(null)
  const [modalLoading, setModalLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")

  useEffect(() => {
    async function loadPage() {
      try {
        setLoading(true)
        setErrorMessage("")

        const response = await fetch(`/api/visitantes?page=${page}&limit=20`)
        const result = (await response.json()) as {
          success: boolean
          items?: VisitanteListItem[]
          totalPages?: number
          error?: { message?: string }
        }

        if (!response.ok || !result.items) {
          throw new Error(result.error?.message ?? "Nao foi possivel carregar visitantes")
        }

        setItems(result.items)
        setTotalPages(Math.max(result.totalPages ?? 1, 1))
      } catch (error) {
        setErrorMessage(error instanceof Error ? error.message : "Erro ao carregar visitantes")
      } finally {
        setLoading(false)
      }
    }

    void loadPage()
  }, [page])

  async function handleOpenDetail(id: string) {
    try {
      setModalLoading(true)
      setSelectedId(id)
      const response = await fetch(`/api/visitantes/${id}`)
      const result = (await response.json()) as {
        success: boolean
        visitante?: VisitanteDetail
        error?: { message?: string }
      }

      if (!response.ok || !result.visitante) {
        throw new Error(result.error?.message ?? "Nao foi possivel carregar detalhe")
      }

      setSelected(result.visitante)
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Erro ao abrir detalhe")
      setSelectedId(null)
      setSelected(null)
    } finally {
      setModalLoading(false)
    }
  }

  return (
    <Stack spacing={2.5}>
      <Box sx={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 1.5 }}>
        <Typography variant="h4" sx={{ fontWeight: 800 }}>
          Visitantes
        </Typography>
        <Button variant="contained" onClick={() => router.push("/visitantes/novo")}>
          Cadastrar visitante
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
          {items.map((item) => (
            <Card key={item.id}>
              <CardActionArea onClick={() => void handleOpenDetail(item.id)}>
                <CardContent
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: 2,
                    flexWrap: "wrap"
                  }}
                >
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>
                      {item.name}
                    </Typography>
                    <Typography color="text.secondary" variant="body2">
                      Nascimento: {formatDate(item.birthDate)}
                    </Typography>
                    <Typography color="text.secondary" variant="body2">
                      Telefone: {item.phone ?? "Nao informado"}
                    </Typography>
                  </Box>

                  <Typography color="text.secondary" variant="body2">
                    Cadastro: {formatDate(item.createdAt)}
                  </Typography>
                </CardContent>
              </CardActionArea>
            </Card>
          ))}

          {items.length === 0 && (
            <Typography color="text.secondary">Nenhum visitante cadastrado ainda.</Typography>
          )}

          <Box sx={{ display: "flex", justifyContent: "center", pt: 1 }}>
            <Pagination count={totalPages} page={page} onChange={(_, value) => setPage(value)} />
          </Box>
        </Stack>
      )}

      <Dialog
        open={Boolean(selectedId)}
        onClose={() => {
          setSelectedId(null)
          setSelected(null)
        }}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle>Detalhes do visitante</DialogTitle>
        <DialogContent dividers>
          {modalLoading || !selected ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 5 }}>
              <CircularProgress />
            </Box>
          ) : (
            <Stack spacing={1.5}>
              <Typography>
                <strong>Nome:</strong> {selected.member.name}
              </Typography>
              <Typography>
                <strong>Data de nascimento:</strong> {formatDate(selected.member.birthDate)}
              </Typography>
              <Typography>
                <strong>Telefone:</strong> {selected.member.phone ?? "Nao informado"}
              </Typography>
              <Typography>
                <strong>Batizado:</strong> {selected.member.baptized ? "Sim" : "Nao"}
              </Typography>
              <Typography>
                <strong>Igreja atual:</strong> {translateActualChurch(selected.visitorProfile.actualChurch)}
              </Typography>
              <Typography>
                <strong>Como conheceu:</strong> {translateHowKnow(selected.visitorProfile.howKnow)}
              </Typography>

              {selected.visitorProfile.howKnowOtherAnswer && (
                <Typography>
                  <strong>Outra resposta:</strong> {selected.visitorProfile.howKnowOtherAnswer}
                </Typography>
              )}

              <Box>
                <Typography sx={{ fontWeight: 700 }}>Pedido de oracao</Typography>
                <Typography color="text.secondary">
                  {selected.prayers[0]?.text ?? "Nenhum pedido informado"}
                </Typography>
              </Box>

              <Box>
                <Typography sx={{ fontWeight: 700 }}>Familiares</Typography>
                <Stack spacing={0.8} sx={{ mt: 0.5 }}>
                  {selected.familyRelationships.map((item) => (
                    <Typography key={item.id} color="text.secondary" variant="body2">
                      {item.relatedMember.name} - {translateRelationshipType(item.relationshipType)}
                    </Typography>
                  ))}
                  {selected.familyRelationships.length === 0 && (
                    <Typography color="text.secondary" variant="body2">
                      Nenhum familiar vinculado.
                    </Typography>
                  )}
                </Stack>
              </Box>
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setSelectedId(null)
              setSelected(null)
            }}
          >
            Fechar
          </Button>
          <Button
            variant="contained"
            disabled={!selectedId}
            onClick={() => {
              if (!selectedId) {
                return
              }

              router.push(`/visitantes/${selectedId}/editar`)
            }}
          >
            Editar
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  )
}
