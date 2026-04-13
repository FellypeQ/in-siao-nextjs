import { findVisitanteByIdRepository } from "@/modules/visitantes/repositories/find-visitante-by-id.repository"
import { AppError } from "@/shared/errors/app-error"

export async function getVisitanteDetailService(memberId: string) {
  const visitante = await findVisitanteByIdRepository(memberId)

  if (!visitante || !visitante.visitorProfile) {
    throw new AppError("Visitante nao encontrado", 404, "VISITANTE_NOT_FOUND")
  }

  return {
    member: {
      id: visitante.id,
      name: visitante.name,
      birthDate: visitante.birthDate,
      document: visitante.document,
      phone: visitante.phone,
      type: visitante.type,
      baptized: visitante.baptized,
      createdAt: visitante.createdAt,
      updatedAt: visitante.updatedAt
    },
    visitorProfile: {
      actualChurch: visitante.visitorProfile.actualChurch,
      howKnow: visitante.visitorProfile.howKnow,
      howKnowOtherAnswer: visitante.visitorProfile.howKnowOtherAnswer
    },
    prayers: visitante.memberPrays.map((item) => ({
      id: item.pray.id,
      text: item.pray.text,
      createdAt: item.pray.createdAt
    })),
    familyRelationships: visitante.principalRelations
  }
}
