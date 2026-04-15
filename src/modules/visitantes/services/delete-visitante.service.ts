import { deleteMemberRepository } from "@/modules/visitantes/repositories/delete-member.repository";
import { findVisitanteByIdRepository } from "@/modules/visitantes/repositories/find-visitante-by-id.repository";
import { AppError } from "@/shared/errors/app-error";

export async function deleteVisitanteService(id: string) {
  const visitante = await findVisitanteByIdRepository(id);

  if (!visitante) {
    throw new AppError("Visitante nao encontrado", 404, "VISITANTE_NOT_FOUND");
  }

  await deleteMemberRepository(id);

  return { success: true };
}
