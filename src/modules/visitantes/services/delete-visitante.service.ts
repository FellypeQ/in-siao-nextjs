import { deleteVisitanteRepository } from "@/modules/visitantes/repositories/delete-visitante.repository"
import { findVisitanteByIdRepository } from "@/modules/visitantes/repositories/find-visitante-by-id.repository"
import { AppError } from "@/shared/errors/app-error"

export async function deleteVisitanteService(id: string) {
  const visitante = await findVisitanteByIdRepository(id)

  if (!visitante) {
    throw new AppError("Visitante nao encontrado", 404, "VISITANTE_NOT_FOUND")
  }

  await deleteVisitanteRepository(id)

  return { success: true }
}
