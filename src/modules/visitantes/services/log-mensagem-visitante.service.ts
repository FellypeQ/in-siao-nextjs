import { AppError } from "@/shared/errors/app-error"
import { findVisitanteByIdRepository } from "@/modules/visitantes/repositories/find-visitante-by-id.repository"
import { getVisitanteMensagensRepository } from "@/modules/visitantes/repositories/get-visitante-mensagens.repository"
import { createMemberMessageLogRepository } from "@/modules/visitantes/repositories/log-mensagem-visitante.repository"
import { findMessageTemplateByIdRepository } from "@/modules/mensagens/repositories/update-message-template.repository"

export async function logMensagemVisitanteService(
  memberId: string,
  messageTemplateId: string,
  sentByUserId: string
) {
  const visitante = await findVisitanteByIdRepository(memberId)
  if (!visitante) {
    throw new AppError("Visitante não encontrado", 404, "VISITANTE_NOT_FOUND")
  }

  const template = await findMessageTemplateByIdRepository(messageTemplateId)
  if (!template) {
    throw new AppError("Template não encontrado", 404, "TEMPLATE_NOT_FOUND")
  }

  const { templates, logs } = await getVisitanteMensagensRepository(memberId)
  const sentTemplateIds = new Set(logs.map((l) => l.messageTemplateId).filter(Boolean))

  if (sentTemplateIds.has(messageTemplateId)) {
    throw new AppError("Esta mensagem já foi enviada para o visitante", 409, "ALREADY_SENT")
  }

  const nextTemplate = templates.find((candidate) => !sentTemplateIds.has(candidate.id))

  if (!nextTemplate) {
    throw new AppError("Nao ha proxima mensagem pendente para este visitante", 409, "NO_PENDING_MESSAGE")
  }

  if (nextTemplate.id !== messageTemplateId) {
    throw new AppError("Apenas a proxima mensagem pendente pode ser enviada", 409, "INVALID_NEXT_TEMPLATE")
  }

  const firstName = visitante.name.split(" ")[0]
  const processedBody = template.body.replace(/\{nome_do_visitante\}/g, firstName)

  return createMemberMessageLogRepository({
    memberId,
    messageTemplateId,
    messageTitle: template.title,
    messageBody: processedBody,
    sentByUserId,
  })
}
