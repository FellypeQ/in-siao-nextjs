import { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { createMemberRepository } from "@/modules/visitantes/repositories/create-member.repository";
import { createMemberPrayRepository } from "@/modules/visitantes/repositories/create-member-pray.repository";
import { createMemberRelationshipRepository } from "@/modules/visitantes/repositories/create-member-relationship.repository";
import { createMemberVisitorRepository } from "@/modules/visitantes/repositories/create-member-visitor.repository";
import { createPrayRepository } from "@/modules/visitantes/repositories/create-pray.repository";
import type { CreateVisitanteInput } from "@/modules/visitantes/types/visitante.type";
import { AppError } from "@/shared/errors/app-error";

function mapPrismaError(error: unknown): never {
  if (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === "P2002" &&
    Array.isArray(error.meta?.target)
  ) {
    const target = error.meta.target.join(",");

    if (target.includes("document")) {
      throw new AppError(
        "Documento ja cadastrado",
        409,
        "DOCUMENT_ALREADY_EXISTS",
      );
    }

    if (target.includes("name") && target.includes("birthDate")) {
      throw new AppError(
        "Ja existe membro com mesmo nome e data de nascimento",
        409,
        "MEMBER_ALREADY_EXISTS",
      );
    }
  }

  throw error;
}

export async function createVisitanteService(input: CreateVisitanteInput) {
  try {
    return await prisma.$transaction(async (tx) => {
      const visitante = await createMemberRepository(
        {
          name: input.name,
          birthDate: input.birthDate,
          document: input.document,
          phone: input.phone,
          baptized: false,
          type: "VISITOR",
        },
        tx,
      );

      await createMemberVisitorRepository(
        {
          memberId: visitante.id,
          actualChurch: input.actualChurch,
          howKnow: input.howKnow,
          howKnowOtherAnswer: input.howKnowOtherAnswer,
        },
        tx,
      );

      if (input.prayText) {
        const pray = await createPrayRepository({ text: input.prayText }, tx);
        await createMemberPrayRepository(
          { memberId: visitante.id, prayId: pray.id },
          tx,
        );
      }

      for (const familyMember of input.familyMembers) {
        const createdFamilyMember = await createMemberRepository(
          {
            name: familyMember.name,
            birthDate: familyMember.birthDate,
            phone: familyMember.phone,
            baptized: false,
            type: "VISITOR",
          },
          tx,
        );

        await createMemberRelationshipRepository(
          {
            principalMemberId: visitante.id,
            relatedMemberId: createdFamilyMember.id,
            relationshipType: familyMember.relationshipType,
          },
          tx,
        );
      }

      return visitante;
    });
  } catch (error) {
    mapPrismaError(error);
  }
}
