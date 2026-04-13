import { Prisma } from "@prisma/client"

import { prisma } from "@/lib/prisma"
import { countMemberRelationshipsByMemberIdRepository } from "@/modules/visitantes/repositories/count-member-relationships-by-member-id.repository"
import { createMemberRepository } from "@/modules/visitantes/repositories/create-member.repository"
import { createMemberPrayRepository } from "@/modules/visitantes/repositories/create-member-pray.repository"
import { createMemberRelationshipRepository } from "@/modules/visitantes/repositories/create-member-relationship.repository"
import { createPrayRepository } from "@/modules/visitantes/repositories/create-pray.repository"
import { deleteMemberPraysByMemberIdRepository } from "@/modules/visitantes/repositories/delete-member-prays-by-member-id.repository"
import { deleteMemberRelationshipRepository } from "@/modules/visitantes/repositories/delete-member-relationship.repository"
import { deleteMemberRepository } from "@/modules/visitantes/repositories/delete-member.repository"
import { deletePraysByIdsRepository } from "@/modules/visitantes/repositories/delete-prays-by-ids.repository"
import { findMemberPraysByMemberIdRepository } from "@/modules/visitantes/repositories/find-member-prays-by-member-id.repository"
import { findMemberRelationshipByIdRepository } from "@/modules/visitantes/repositories/find-member-relationship-by-id.repository"
import { findVisitanteByIdRepository } from "@/modules/visitantes/repositories/find-visitante-by-id.repository"
import { updateMemberRelationshipRepository } from "@/modules/visitantes/repositories/update-member-relationship.repository"
import { updateMemberRepository } from "@/modules/visitantes/repositories/update-member.repository"
import { updateMemberVisitorRepository } from "@/modules/visitantes/repositories/update-member-visitor.repository"
import type { UpdateVisitanteInput } from "@/modules/visitantes/types/visitante.type"
import { AppError } from "@/shared/errors/app-error"

function mapPrismaError(error: unknown): never {
  if (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === "P2002" &&
    Array.isArray(error.meta?.target)
  ) {
    const target = error.meta.target.join(",")

    if (target.includes("document")) {
      throw new AppError("Documento ja cadastrado", 409, "DOCUMENT_ALREADY_EXISTS")
    }

    if (target.includes("name") && target.includes("birthDate")) {
      throw new AppError(
        "Ja existe membro com mesmo nome e data de nascimento",
        409,
        "MEMBER_ALREADY_EXISTS"
      )
    }
  }

  throw error
}

export async function updateVisitanteService(input: UpdateVisitanteInput) {
  const existingVisitante = await findVisitanteByIdRepository(input.id)

  if (!existingVisitante || !existingVisitante.visitorProfile) {
    throw new AppError("Visitante nao encontrado", 404, "VISITANTE_NOT_FOUND")
  }

  try {
    return await prisma.$transaction(async (tx) => {
      await updateMemberRepository(
        {
          id: input.id,
          name: input.name,
          birthDate: input.birthDate,
          document: input.document,
          phone: input.phone,
          baptized: input.baptized
        },
        tx
      )

      await updateMemberVisitorRepository(
        {
          memberId: input.id,
          actualChurch: input.actualChurch,
          howKnow: input.howKnow,
          howKnowOtherAnswer: input.howKnowOtherAnswer
        },
        tx
      )

      const existingMemberPrays = await findMemberPraysByMemberIdRepository(input.id, tx)
      const prayIdsToDelete = existingMemberPrays.map((item) => item.prayId)
      await deleteMemberPraysByMemberIdRepository(input.id, tx)
      await deletePraysByIdsRepository(prayIdsToDelete, tx)

      if (input.prayText) {
        const pray = await createPrayRepository({ text: input.prayText }, tx)
        await createMemberPrayRepository({ memberId: input.id, prayId: pray.id }, tx)
      }

      for (const operation of input.familyOperations) {
        if (operation.action === "create") {
          const familyMember = await createMemberRepository(
            {
              name: operation.payload.name,
              birthDate: operation.payload.birthDate,
              phone: operation.payload.phone,
              baptized: false,
              type: "VISITOR"
            },
            tx
          )

          await createMemberRelationshipRepository(
            {
              principalMemberId: input.id,
              relatedMemberId: familyMember.id,
              relationshipType: operation.payload.relationshipType
            },
            tx
          )
          continue
        }

        const relationship = await findMemberRelationshipByIdRepository(operation.relationshipId, tx)

        if (!relationship || relationship.principalMemberId !== input.id) {
          throw new AppError("Relacionamento familiar invalido", 400, "INVALID_FAMILY_RELATIONSHIP")
        }

        if (operation.action === "unlink") {
          await deleteMemberRelationshipRepository(operation.relationshipId, tx)
          continue
        }

        if (relationship.relatedMemberId !== operation.memberId) {
          throw new AppError("Membro familiar invalido", 400, "INVALID_FAMILY_MEMBER")
        }

        if (operation.action === "update") {
          await updateMemberRepository(
            {
              id: operation.memberId,
              name: operation.payload.name,
              birthDate: operation.payload.birthDate,
              phone: operation.payload.phone,
              baptized: false
            },
            tx
          )

          await updateMemberRelationshipRepository(
            {
              id: operation.relationshipId,
              relationshipType: operation.payload.relationshipType
            },
            tx
          )

          continue
        }

        await deleteMemberRelationshipRepository(operation.relationshipId, tx)

        const relationshipCount = await countMemberRelationshipsByMemberIdRepository(operation.memberId, tx)

        if (relationshipCount === 0) {
          await deleteMemberRepository(operation.memberId, tx)
        }
      }

      return { id: input.id }
    })
  } catch (error) {
    mapPrismaError(error)
  }
}
