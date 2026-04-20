import { prisma } from "@/lib/prisma"
import { deleteMemberRepository } from "@/modules/visitantes/repositories/delete-member.repository"
import { findVisitanteByIdRepository } from "@/modules/visitantes/repositories/find-visitante-by-id.repository"
import { findRelatedMemberIdsRepository } from "@/modules/visitantes/repositories/find-related-member-ids.repository"
import { isOrphanMemberRepository } from "@/modules/visitantes/repositories/is-orphan-member.repository"
import { AppError } from "@/shared/errors/app-error"

export async function deleteVisitanteService(id: string) {
  const visitante = await findVisitanteByIdRepository(id)

  if (!visitante) {
    throw new AppError("Visitante nao encontrado", 404, "VISITANTE_NOT_FOUND")
  }

  // Coleta os familiares antes da exclusao do principal, pois os vinculos sao removidos por cascade.
  const relatedMemberIds = await findRelatedMemberIdsRepository(id)

  await prisma.$transaction(async (tx) => {
    await deleteMemberRepository(id, tx)

    for (const relatedMemberId of relatedMemberIds) {
      const isOrphan = await isOrphanMemberRepository(relatedMemberId, tx)

      if (isOrphan) {
        await deleteMemberRepository(relatedMemberId, tx)
      }
    }
  })

  return { success: true }
}
