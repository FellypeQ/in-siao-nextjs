import type { ActualChurch, HowKnow } from "@prisma/client"

import { prisma } from "@/lib/prisma"
import type { RepositoryClient } from "@/modules/visitantes/repositories/repository-client.type"

type CreateMemberVisitorRepositoryInput = {
  memberId: string
  actualChurch: ActualChurch
  howKnow: HowKnow
  howKnowOtherAnswer?: string
}

export async function createMemberVisitorRepository(
  input: CreateMemberVisitorRepositoryInput,
  db: RepositoryClient = prisma
) {
  return db.memberVisitor.create({
    data: {
      memberId: input.memberId,
      actualChurch: input.actualChurch,
      howKnow: input.howKnow,
      howKnowOtherAnswer: input.howKnowOtherAnswer
    }
  })
}
