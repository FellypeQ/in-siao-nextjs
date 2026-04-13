import { prisma } from "@/lib/prisma"
import type { RepositoryClient } from "@/modules/visitantes/repositories/repository-client.type"

export async function countMemberRelationshipsByMemberIdRepository(
  memberId: string,
  db: RepositoryClient = prisma
) {
  return db.memberRelationship.count({
    where: {
      OR: [{ principalMemberId: memberId }, { relatedMemberId: memberId }]
    }
  })
}
