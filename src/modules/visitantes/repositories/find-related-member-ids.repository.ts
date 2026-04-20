import { prisma } from "@/lib/prisma"
import type { RepositoryClient } from "@/modules/visitantes/repositories/repository-client.type"

export async function findRelatedMemberIdsRepository(
  memberId: string,
  db: RepositoryClient = prisma
) {
  // Precisamos coletar familiares antes do delete do principal, pois os relacionamentos somem por cascade.
  const relationships = await db.memberRelationship.findMany({
    where: { principalMemberId: memberId },
    select: { relatedMemberId: true }
  })

  return Array.from(new Set(relationships.map((relationship) => relationship.relatedMemberId)))
}
