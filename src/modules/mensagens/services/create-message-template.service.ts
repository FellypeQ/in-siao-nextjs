import {
  createMessageTemplateRepository,
  getMaxOrderRepository,
} from "@/modules/mensagens/repositories/create-message-template.repository"
import { CreateMessageTemplateInput } from "@/modules/mensagens/types/message-template.type"

export async function createMessageTemplateService(data: CreateMessageTemplateInput) {
  const maxOrder = await getMaxOrderRepository()
  return createMessageTemplateRepository({ ...data, order: maxOrder + 1 })
}
