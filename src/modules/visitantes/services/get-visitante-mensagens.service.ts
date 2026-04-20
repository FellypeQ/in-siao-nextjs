import { AppError } from "@/shared/errors/app-error"
import { findVisitanteByIdRepository } from "@/modules/visitantes/repositories/find-visitante-by-id.repository"
import { getVisitanteMensagensRepository } from "@/modules/visitantes/repositories/get-visitante-mensagens.repository"

export async function getVisitanteMensagensService(memberId: string) {
  const visitante = await findVisitanteByIdRepository(memberId)
  if (!visitante) {
    throw new AppError("Visitante não encontrado", 404, "VISITANTE_NOT_FOUND")
  }

  const { templates, logs } = await getVisitanteMensagensRepository(memberId)

  const sentTemplateIds = new Set(logs.map((l) => l.messageTemplateId).filter(Boolean))

  const nextTemplate =
    templates.find((t) => !sentTemplateIds.has(t.id)) ?? null

  const processedBody = nextTemplate
    ? nextTemplate.body.replace(
        /\{nome_do_visitante\}/g,
        visitante.name.split(" ")[0]
      )
    : null

  return {
    templates,
    sentLogs: logs,
    nextTemplate: nextTemplate
      ? { id: nextTemplate.id, title: nextTemplate.title, processedBody: processedBody! }
      : null,
  }
}
