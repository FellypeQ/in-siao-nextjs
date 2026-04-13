"use client"

import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Grid,
  IconButton,
  MenuItem,
  Stack,
  TextField,
  Typography
} from "@mui/material"
import DeleteIcon from "@mui/icons-material/Delete"
import LinkOffIcon from "@mui/icons-material/LinkOff"
import { useRouter } from "next/navigation"
import { useEffect, useMemo, useState } from "react"

type FormMode = "create" | "edit"

type RelationshipType =
  | "SPOUSE"
  | "CHILD"
  | "FATHER"
  | "MOTHER"
  | "SIBLING"
  | "GRANDPARENT"
  | "GRANDCHILD"
  | "UNCLE_AUNT"
  | "COUSIN"
  | "OTHER"

type FamilyFormItem = {
  localId: string
  relationshipId?: string
  memberId?: string
  name: string
  birthDate: string
  phone: string
  relationshipType: RelationshipType
  persisted: boolean
}

type FamilyOperation =
  | {
      action: "create"
      payload: {
        name: string
        birthDate: string
        phone?: string
        relationshipType: RelationshipType
      }
    }
  | {
      action: "update"
      relationshipId: string
      memberId: string
      payload: {
        name: string
        birthDate: string
        phone?: string
        relationshipType: RelationshipType
      }
    }
  | { action: "unlink"; relationshipId: string }
  | { action: "delete"; relationshipId: string; memberId: string }

type VisitanteFormProps = {
  mode: FormMode
  visitanteId?: string
}

type VisitanteFormState = {
  name: string
  birthDate: string
  phone: string
  baptized: "true" | "false"
  actualChurch: "NONE" | "EVANGELICAL" | "CATHOLIC" | "OTHER" | "NO_REPORT"
  howKnow:
    | "FRIEND_OR_FAMILY_REFERRAL"
    | "SOCIAL_MEDIA"
    | "WALK_IN"
    | "EVENT"
    | "GOOGLE_SEARCH"
    | "OTHER"
  howKnowOtherAnswer: string
  prayText: string
}

const initialState: VisitanteFormState = {
  name: "",
  birthDate: "",
  phone: "",
  baptized: "false",
  actualChurch: "NONE",
  howKnow: "FRIEND_OR_FAMILY_REFERRAL",
  howKnowOtherAnswer: "",
  prayText: ""
}

const relationshipOptions: Array<{ value: RelationshipType; label: string }> = [
  { value: "SPOUSE", label: "Conjuge" },
  { value: "CHILD", label: "Filho(a)" },
  { value: "FATHER", label: "Pai" },
  { value: "MOTHER", label: "Mae" },
  { value: "SIBLING", label: "Irmao(a)" },
  { value: "GRANDPARENT", label: "Avo" },
  { value: "GRANDCHILD", label: "Neto(a)" },
  { value: "UNCLE_AUNT", label: "Tio(a)" },
  { value: "COUSIN", label: "Primo(a)" },
  { value: "OTHER", label: "Outro" }
]

function createFamilyItem(): FamilyFormItem {
  return {
    localId: crypto.randomUUID(),
    name: "",
    birthDate: "",
    phone: "",
    relationshipType: "OTHER",
    persisted: false
  }
}

export function VisitanteForm({ mode, visitanteId }: VisitanteFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(mode === "edit")
  const [submitting, setSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")
  const [successMessage, setSuccessMessage] = useState("")
  const [state, setState] = useState<VisitanteFormState>(initialState)
  const [familyMembers, setFamilyMembers] = useState<FamilyFormItem[]>([])
  const [queuedFamilyOperations, setQueuedFamilyOperations] = useState<FamilyOperation[]>([])

  const isEditMode = mode === "edit"

  const formTitle = useMemo(() => {
    return isEditMode ? "Editar visitante" : "Cadastrar visitante"
  }, [isEditMode])

  useEffect(() => {
    if (!isEditMode || !visitanteId) {
      setLoading(false)
      return
    }

    async function loadVisitante() {
      try {
        setLoading(true)
        const response = await fetch(`/api/visitantes/${visitanteId}`)
        const result = (await response.json()) as {
          success: boolean
          error?: { message?: string }
          visitante?: {
            member: {
              name: string
              birthDate: string
              phone: string | null
              baptized: boolean
            }
            visitorProfile: {
              actualChurch: VisitanteFormState["actualChurch"]
              howKnow: VisitanteFormState["howKnow"]
              howKnowOtherAnswer: string | null
            }
            prayers: Array<{ text: string }>
            familyRelationships: Array<{
              id: string
              relationshipType: RelationshipType
              relatedMember: {
                id: string
                name: string
                birthDate: string
                phone: string | null
              }
            }>
          }
        }

        if (!response.ok || !result.visitante) {
          throw new Error(result.error?.message ?? "Nao foi possivel carregar visitante")
        }

        setState({
          name: result.visitante.member.name,
          birthDate: result.visitante.member.birthDate.slice(0, 10),
          phone: result.visitante.member.phone ?? "",
          baptized: result.visitante.member.baptized ? "true" : "false",
          actualChurch: result.visitante.visitorProfile.actualChurch,
          howKnow: result.visitante.visitorProfile.howKnow,
          howKnowOtherAnswer: result.visitante.visitorProfile.howKnowOtherAnswer ?? "",
          prayText: result.visitante.prayers[0]?.text ?? ""
        })

        setFamilyMembers(
          result.visitante.familyRelationships.map((item) => ({
            localId: crypto.randomUUID(),
            relationshipId: item.id,
            memberId: item.relatedMember.id,
            name: item.relatedMember.name,
            birthDate: item.relatedMember.birthDate.slice(0, 10),
            phone: item.relatedMember.phone ?? "",
            relationshipType: item.relationshipType,
            persisted: true
          }))
        )
      } catch (error) {
        setErrorMessage(error instanceof Error ? error.message : "Erro ao carregar visitante")
      } finally {
        setLoading(false)
      }
    }

    void loadVisitante()
  }, [isEditMode, visitanteId])

  function updateState<K extends keyof VisitanteFormState>(key: K, value: VisitanteFormState[K]) {
    setState((current) => ({ ...current, [key]: value }))
  }

  function updateFamily(localId: string, patch: Partial<FamilyFormItem>) {
    setFamilyMembers((current) =>
      current.map((item) => (item.localId === localId ? { ...item, ...patch } : item))
    )
  }

  function removeFamily(localId: string) {
    setFamilyMembers((current) => current.filter((item) => item.localId !== localId))
  }

  function enqueueOperation(operation: FamilyOperation) {
    setQueuedFamilyOperations((current) => [...current, operation])
  }

  async function handleSubmit(action: "save" | "saveAndAddAnother") {
    setErrorMessage("")
    setSuccessMessage("")
    setSubmitting(true)

    try {
      if (isEditMode && visitanteId) {
        const persistedUpdates = familyMembers
          .filter((item) => item.persisted && item.relationshipId && item.memberId)
          .map((item) => ({
            action: "update" as const,
            relationshipId: item.relationshipId!,
            memberId: item.memberId!,
            payload: {
              name: item.name,
              birthDate: item.birthDate,
              phone: item.phone || undefined,
              relationshipType: item.relationshipType
            }
          }))

        const newCreates = familyMembers
          .filter((item) => !item.persisted)
          .map((item) => ({
            action: "create" as const,
            payload: {
              name: item.name,
              birthDate: item.birthDate,
              phone: item.phone || undefined,
              relationshipType: item.relationshipType
            }
          }))

        const payload = {
          name: state.name,
          birthDate: state.birthDate,
          phone: state.phone || undefined,
          baptized: state.baptized === "true",
          actualChurch: state.actualChurch,
          howKnow: state.howKnow,
          howKnowOtherAnswer: state.howKnowOtherAnswer || undefined,
          prayText: state.prayText || undefined,
          familyOperations: [...queuedFamilyOperations, ...persistedUpdates, ...newCreates]
        }

        const response = await fetch(`/api/visitantes/${visitanteId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        })

        const result = (await response.json()) as { success: boolean; error?: { message?: string } }

        if (!response.ok) {
          throw new Error(result.error?.message ?? "Nao foi possivel salvar alteracoes")
        }

        if (action === "saveAndAddAnother") {
          router.push("/visitantes/novo")
          return
        }

        router.push("/visitantes")
        router.refresh()
        return
      }

      const payload = {
        name: state.name,
        birthDate: state.birthDate,
        phone: state.phone || undefined,
        baptized: state.baptized === "true",
        actualChurch: state.actualChurch,
        howKnow: state.howKnow,
        howKnowOtherAnswer: state.howKnowOtherAnswer || undefined,
        prayText: state.prayText || undefined,
        familyMembers: familyMembers.map((item) => ({
          name: item.name,
          birthDate: item.birthDate,
          phone: item.phone || undefined,
          relationshipType: item.relationshipType
        }))
      }

      const response = await fetch("/api/visitantes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      })

      const result = (await response.json()) as { success: boolean; error?: { message?: string } }

      if (!response.ok) {
        throw new Error(result.error?.message ?? "Nao foi possivel cadastrar visitante")
      }

      if (action === "saveAndAddAnother") {
        setState(initialState)
        setFamilyMembers([])
        setQueuedFamilyOperations([])
        setSuccessMessage("Visitante salvo. Formulario pronto para novo cadastro.")
        return
      }

      router.push("/visitantes")
      router.refresh()
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Erro ao salvar")
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
        <CircularProgress />
      </Box>
    )
  }

  return (
    <Stack spacing={2.5}>
      <Typography variant="h4" sx={{ fontWeight: 800 }}>
        {formTitle}
      </Typography>

      <Card>
        <CardContent>
          <Stack spacing={2.5}>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  label="Nome completo"
                  value={state.name}
                  onChange={(event) => updateState("name", event.target.value)}
                  required
                  fullWidth
                />
              </Grid>
              <Grid size={{ xs: 12, md: 3 }}>
                <TextField
                  label="Data de nascimento"
                  type="date"
                  value={state.birthDate}
                  onChange={(event) => updateState("birthDate", event.target.value)}
                  slotProps={{ inputLabel: { shrink: true } }}
                  required
                  fullWidth
                />
              </Grid>
              <Grid size={{ xs: 12, md: 3 }}>
                <TextField
                  label="Telefone/WhatsApp"
                  value={state.phone}
                  onChange={(event) => updateState("phone", event.target.value)}
                  fullWidth
                />
              </Grid>

              <Grid size={{ xs: 12, md: 3 }}>
                <TextField
                  select
                  label="Batizado?"
                  value={state.baptized}
                  onChange={(event) => updateState("baptized", event.target.value as "true" | "false")}
                  required
                  fullWidth
                >
                  <MenuItem value="true">Sim</MenuItem>
                  <MenuItem value="false">Nao</MenuItem>
                </TextField>
              </Grid>

              <Grid size={{ xs: 12, md: 5 }}>
                <TextField
                  select
                  label="Voce ja frequenta alguma igreja ou comunidade religiosa?"
                  value={state.actualChurch}
                  onChange={(event) =>
                    updateState(
                      "actualChurch",
                      event.target.value as VisitanteFormState["actualChurch"]
                    )
                  }
                  required
                  fullWidth
                >
                  <MenuItem value="NONE">Nao frequento nenhuma</MenuItem>
                  <MenuItem value="EVANGELICAL">Igreja evangelica</MenuItem>
                  <MenuItem value="CATHOLIC">Igreja catolica</MenuItem>
                  <MenuItem value="OTHER">Outra religiao</MenuItem>
                  <MenuItem value="NO_REPORT">Prefiro nao responder</MenuItem>
                </TextField>
              </Grid>

              <Grid size={{ xs: 12, md: 4 }}>
                <TextField
                  select
                  label="Como voce conheceu nossa igreja?"
                  value={state.howKnow}
                  onChange={(event) =>
                    updateState("howKnow", event.target.value as VisitanteFormState["howKnow"])
                  }
                  required
                  fullWidth
                >
                  <MenuItem value="FRIEND_OR_FAMILY_REFERRAL">Indicacao de amigos/familia</MenuItem>
                  <MenuItem value="SOCIAL_MEDIA">Redes sociais</MenuItem>
                  <MenuItem value="WALK_IN">Passei na frente</MenuItem>
                  <MenuItem value="EVENT">Evento</MenuItem>
                  <MenuItem value="GOOGLE_SEARCH">Google</MenuItem>
                  <MenuItem value="OTHER">Outra</MenuItem>
                </TextField>
              </Grid>

              {state.howKnow === "OTHER" && (
                <Grid size={{ xs: 12 }}>
                  <TextField
                    label="Como conheceu (outra resposta)"
                    value={state.howKnowOtherAnswer}
                    onChange={(event) => updateState("howKnowOtherAnswer", event.target.value)}
                    required
                    fullWidth
                  />
                </Grid>
              )}

              <Grid size={{ xs: 12 }}>
                <TextField
                  label="Gostariamos que orasemos por algum motivo especial?"
                  value={state.prayText}
                  onChange={(event) => updateState("prayText", event.target.value)}
                  multiline
                  minRows={3}
                  fullWidth
                />
              </Grid>
            </Grid>

            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              Membros familiares
            </Typography>

            {familyMembers.map((member, index) => (
              <Card key={member.localId} variant="outlined">
                <CardContent>
                  <Stack spacing={1.5}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                      Familiar {index + 1}
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid size={{ xs: 12, md: 4 }}>
                        <TextField
                          label="Nome completo"
                          value={member.name}
                          onChange={(event) => updateFamily(member.localId, { name: event.target.value })}
                          required
                          fullWidth
                        />
                      </Grid>
                      <Grid size={{ xs: 12, md: 3 }}>
                        <TextField
                          label="Data de nascimento"
                          type="date"
                          value={member.birthDate}
                          onChange={(event) =>
                            updateFamily(member.localId, { birthDate: event.target.value })
                          }
                          slotProps={{ inputLabel: { shrink: true } }}
                          required
                          fullWidth
                        />
                      </Grid>
                      <Grid size={{ xs: 12, md: 3 }}>
                        <TextField
                          label="Telefone"
                          value={member.phone}
                          onChange={(event) => updateFamily(member.localId, { phone: event.target.value })}
                          fullWidth
                        />
                      </Grid>
                      <Grid size={{ xs: 12, md: 2 }}>
                        <TextField
                          select
                          label="Parentesco"
                          value={member.relationshipType}
                          onChange={(event) =>
                            updateFamily(member.localId, {
                              relationshipType: event.target.value as RelationshipType
                            })
                          }
                          required
                          fullWidth
                        >
                          {relationshipOptions.map((option) => (
                            <MenuItem key={option.value} value={option.value}>
                              {option.label}
                            </MenuItem>
                          ))}
                        </TextField>
                      </Grid>
                    </Grid>

                    <Box sx={{ display: "flex", justifyContent: "space-between", gap: 1 }}>
                      <Button color="inherit" onClick={() => removeFamily(member.localId)}>
                        Remover bloco
                      </Button>

                      {isEditMode && member.persisted && member.relationshipId && member.memberId && (
                        <Box sx={{ display: "flex", gap: 1 }}>
                          <IconButton
                            color="warning"
                            onClick={() => {
                              enqueueOperation({
                                action: "unlink",
                                relationshipId: member.relationshipId!
                              })
                              removeFamily(member.localId)
                            }}
                            aria-label="Desvincular familiar"
                          >
                            <LinkOffIcon />
                          </IconButton>
                          <IconButton
                            color="error"
                            onClick={() => {
                              enqueueOperation({
                                action: "delete",
                                relationshipId: member.relationshipId!,
                                memberId: member.memberId!
                              })
                              removeFamily(member.localId)
                            }}
                            aria-label="Excluir familiar"
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Box>
                      )}
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            ))}

            <Box>
              <Button variant="outlined" onClick={() => setFamilyMembers((current) => [...current, createFamilyItem()])}>
                Adicionar membro familiar
              </Button>
            </Box>

            {errorMessage && <Alert severity="error">{errorMessage}</Alert>}
            {successMessage && <Alert severity="success">{successMessage}</Alert>}

            <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap" }}>
              <Button variant="text" onClick={() => router.push("/visitantes")}>Cancelar</Button>
              <Button
                variant="contained"
                onClick={() => void handleSubmit("save")}
                disabled={submitting}
              >
                {submitting ? <CircularProgress size={20} color="inherit" /> : "Salvar"}
              </Button>
              <Button
                variant="outlined"
                onClick={() => void handleSubmit("saveAndAddAnother")}
                disabled={submitting}
              >
                Salvar e adicionar outro
              </Button>
            </Box>
          </Stack>
        </CardContent>
      </Card>
    </Stack>
  )
}
