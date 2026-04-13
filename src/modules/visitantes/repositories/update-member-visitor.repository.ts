import type { ActualChurch, HowKnow } from "@prisma/client"

import { prisma } from "@/lib/prisma"
import type { RepositoryClient } from "@/modules/visitantes/repositories/repository-client.type"

type UpdateMemberVisitorRepositoryInput = {
  memberId: string
  actualChurch: ActualChurch
  howKnow: HowKnow
  howKnowOtherAnswer?: string
}

export async function updateMemberVisitorRepository(
  input: UpdateMemberVisitorRepositoryInput,
  db: RepositoryClient = prisma
) {
  return db.memberVisitor.update({
    where: { memberId: input.memberId },
    data: {
      actualChurch: input.actualChurch,
      howKnow: input.howKnow,
      howKnowOtherAnswer: input.howKnowOtherAnswer
    }
  })
}
