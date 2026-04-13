import { prisma } from "@/lib/prisma"
import type { RepositoryClient } from "@/modules/visitantes/repositories/repository-client.type"

type CreateMemberPrayRepositoryInput = {
  memberId: string
  prayId: string
}

export async function createMemberPrayRepository(
  input: CreateMemberPrayRepositoryInput,
  db: RepositoryClient = prisma
) {
  return db.memberPray.create({
    data: {
      memberId: input.memberId,
      prayId: input.prayId
    }
  })
}
