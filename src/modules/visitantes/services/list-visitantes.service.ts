import { listVisitantesRepository } from "@/modules/visitantes/repositories/list-visitantes.repository"
import type { ListVisitantesInput } from "@/modules/visitantes/schemas/list-visitantes.schema"

export async function listVisitantesService(input: ListVisitantesInput) {
  return listVisitantesRepository(input)
}
