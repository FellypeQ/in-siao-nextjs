import { listMessageTemplatesRepository } from "@/modules/mensagens/repositories/list-message-templates.repository"

export async function listMessageTemplatesService() {
  return listMessageTemplatesRepository()
}
