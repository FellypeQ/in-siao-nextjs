"use client"

import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs"
import { DatePicker } from "@mui/x-date-pickers/DatePicker"
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider"
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
import { ExportVisitantesButton } from "@/frontend/features/visitantes/components/export-visitantes-button"
import { VisitanteMensagensStepper } from "@/frontend/features/visitantes/components/visitante-mensagens-stepper"
import { usePermissions } from "@/frontend/shared/hooks/use-permissions"
import { formatPhone } from "@/frontend/shared/utils/format-phone"
import { Permission } from "@/shared/constants/permissions"
import dayjs from "dayjs"
import "dayjs/locale/pt-br"
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

function formatCivilDate(date: string) {
  const isoDate = date.slice(0, 10)
  const [yearRaw, monthRaw, dayRaw] = isoDate.split("-")
  const year = Number(yearRaw)
  const month = Number(monthRaw)
  const day = Number(dayRaw)

  if (!year || !month || !day) {
    return "Data invalida"
  }

  return new Intl.DateTimeFormat("pt-BR", {
    timeZone: "UTC"
  }).format(new Date(Date.UTC(year, month - 1, day)))
}

function formatDateTime(date: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short"
  }).format(new Date(date))
}

type VisitantesListProps = {
  role: "ADMIN" | "STAFF"
  permissions: string[]
}

export function VisitantesList({ role, permissions }: VisitantesListProps) {
  const router = useRouter()
  const { can } = usePermissions({ role, permissions })
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [items, setItems] = useState<VisitanteListItem[]>([])
  const [totalPages, setTotalPages] = useState(1)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [selected, setSelected] = useState<VisitanteDetail | null>(null)
  const [modalLoading, setModalLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")
  const [draftCreatedFrom, setDraftCreatedFrom] = useState("")
  const [draftCreatedTo, setDraftCreatedTo] = useState("")
  const [appliedCreatedFrom, setAppliedCreatedFrom] = useState("")
  const [appliedCreatedTo, setAppliedCreatedTo] = useState("")
  const canExportVisitantes = can(Permission.VISITANTES_EXPORTAR)
  const canCreateVisitante = can(Permission.VISITANTES_CADASTRAR)
  const canEditVisitante = can(Permission.VISITANTES_EDITAR)
  const canDeleteVisitante = can(Permission.VISITANTES_EXCLUIR)
  const canEnviarMensagem = can(Permission.MENSAGENS_ENVIAR)
  const canVerMensagens = canEnviarMensagem || can(Permission.MENSAGENS_GERENCIAR)
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    async function loadPage() {
      try {
        setLoading(true)
        setErrorMessage("")

        const params = new URLSearchParams({
          page: String(page),
          limit: "20"
        })

        if (appliedCreatedFrom) {
          params.set("createdFrom", appliedCreatedFrom)
        }

        if (appliedCreatedTo) {
          params.set("createdTo", appliedCreatedTo)
        }

        const response = await fetch(`/api/visitantes?${params.toString()}`)
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
  }, [page, appliedCreatedFrom, appliedCreatedTo])

  function handleApplyFilters() {
    if (draftCreatedFrom && draftCreatedTo && draftCreatedFrom > draftCreatedTo) {
      setErrorMessage("Periodo invalido: a data inicial deve ser menor ou igual a final")
      return
    }

    setErrorMessage("")
    setPage(1)
    setAppliedCreatedFrom(draftCreatedFrom)
    setAppliedCreatedTo(draftCreatedTo)
  }

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

  async function handleDelete() {
    if (!selectedId) return

    try {
      setDeleting(true)
      const response = await fetch(`/api/visitantes/${selectedId}`, { method: "DELETE" })

      if (!response.ok) {
        const result = (await response.json()) as { error?: { message?: string } }
        throw new Error(result.error?.message ?? "Nao foi possivel excluir visitante")
      }

      setItems((current) => current.filter((item) => item.id !== selectedId))
      setDeleteConfirmOpen(false)
      setSelectedId(null)
      setSelected(null)
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Erro ao excluir visitante")
      setDeleteConfirmOpen(false)
    } finally {
      setDeleting(false)
    }
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="pt-br">
      <Stack spacing={2.5}>
      <Box sx={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 1.5 }}>
        <Typography variant="h4" sx={{ fontWeight: 800 }}>
          Visitantes
        </Typography>
        <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", alignItems: "center" }}>
          <DatePicker
            label="Cadastro de"
            value={draftCreatedFrom ? dayjs(draftCreatedFrom) : null}
            onChange={(value) => setDraftCreatedFrom(value ? value.format("YYYY-MM-DD") : "")}
            format="DD/MM/YYYY"
            slotProps={{
              textField: {
                size: "small",
                sx: { width: 150 }
              }
            }}
          />
          <DatePicker
            label="Cadastro ate"
            value={draftCreatedTo ? dayjs(draftCreatedTo) : null}
            onChange={(value) => setDraftCreatedTo(value ? value.format("YYYY-MM-DD") : "")}
            format="DD/MM/YYYY"
            slotProps={{
              textField: {
                size: "small",
                sx: { width: 150 }
              }
            }}
          />
          <Button variant="outlined" onClick={handleApplyFilters}>
            Filtrar
          </Button>
          {canExportVisitantes && (
            <ExportVisitantesButton
              onError={setErrorMessage}
              createdFrom={appliedCreatedFrom || undefined}
              createdTo={appliedCreatedTo || undefined}
            />
          )}
          {canCreateVisitante && (
            <Button variant="contained" onClick={() => router.push("/visitantes/novo")}>
              Cadastrar visitante
            </Button>
          )}
        </Box>
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
                      Nascimento: {formatCivilDate(item.birthDate)}
                    </Typography>
                    <Typography color="text.secondary" variant="body2">
                      Telefone: {item.phone ? formatPhone(item.phone) : "Nao informado"}
                    </Typography>
                  </Box>

                  <Typography color="text.secondary" variant="body2">
                    Cadastro: {formatDateTime(item.createdAt)}
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
                <strong>Data de nascimento:</strong> {formatCivilDate(selected.member.birthDate)}
              </Typography>
              <Typography>
                <strong>Telefone:</strong> {selected.member.phone ? formatPhone(selected.member.phone) : "Nao informado"}
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

              {canVerMensagens && selectedId && (
                <Box>
                  <Typography sx={{ fontWeight: 700, mb: 1 }}>Fluxo de mensagens</Typography>
                  <VisitanteMensagensStepper
                    visitanteId={selectedId}
                    visitantePhone={selected.member.phone}
                    canEnviar={canEnviarMensagem}
                  />
                </Box>
              )}
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
          {canDeleteVisitante && (
            <Button
              color="error"
              disabled={!selectedId}
              onClick={() => setDeleteConfirmOpen(true)}
            >
              Excluir
            </Button>
          )}
          {canEditVisitante && (
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
          )}
        </DialogActions>
      </Dialog>

      <Dialog open={deleteConfirmOpen} onClose={() => setDeleteConfirmOpen(false)}>
        <DialogTitle>Confirmar exclusao</DialogTitle>
        <DialogContent>
          <Typography>
            Tem certeza que deseja excluir <strong>{selected?.member.name}</strong>? Esta acao nao pode ser desfeita.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirmOpen(false)} disabled={deleting}>
            Cancelar
          </Button>
          <Button color="error" variant="contained" onClick={() => void handleDelete()} disabled={deleting}>
            {deleting ? <CircularProgress size={20} color="inherit" /> : "Excluir"}
          </Button>
        </DialogActions>
      </Dialog>
      </Stack>
    </LocalizationProvider>
  )
}
