import { AppError } from "@/shared/errors/app-error"
import {
  countLogsForTemplateRepository,
  hardDeleteMessageTemplateRepository,
  softDeleteMessageTemplateRepository,
} from "@/modules/mensagens/repositories/delete-message-template.repository"
import { findMessageTemplateByIdRepository } from "@/modules/mensagens/repositories/update-message-template.repository"

export async function deleteMessageTemplateService(id: string): Promise<{ deleted: "hard" | "soft" }> {
  const template = await findMessageTemplateByIdRepository(id)
  if (!template) {
    throw new AppError("Template não encontrado", 404, "TEMPLATE_NOT_FOUND")
  }

  const logCount = await countLogsForTemplateRepository(id)

  if (logCount > 0) {
    await softDeleteMessageTemplateRepository(id)
    return { deleted: "soft" }
  }

  await hardDeleteMessageTemplateRepository(id)
  return { deleted: "hard" }
}
