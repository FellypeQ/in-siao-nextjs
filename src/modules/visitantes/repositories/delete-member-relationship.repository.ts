import { prisma } from "@/lib/prisma"
import type { RepositoryClient } from "@/modules/visitantes/repositories/repository-client.type"

export async function deleteMemberRelationshipRepository(
  relationshipId: string,
  db: RepositoryClient = prisma
) {
  return db.memberRelationship.delete({
    where: { id: relationshipId }
  })
}
