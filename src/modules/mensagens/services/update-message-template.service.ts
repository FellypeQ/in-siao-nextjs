import { AppError } from "@/shared/errors/app-error"
import {
  findMessageTemplateByIdRepository,
  updateMessageTemplateRepository,
} from "@/modules/mensagens/repositories/update-message-template.repository"
import { UpdateMessageTemplateInput } from "@/modules/mensagens/types/message-template.type"

export async function updateMessageTemplateService(data: UpdateMessageTemplateInput) {
  const { id, ...fields } = data

  const template = await findMessageTemplateByIdRepository(id)
  if (!template) {
    throw new AppError("Template não encontrado", 404, "TEMPLATE_NOT_FOUND")
  }

  return updateMessageTemplateRepository(id, fields)
}
