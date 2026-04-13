import { prisma } from "@/lib/prisma"
import type { RepositoryClient } from "@/modules/visitantes/repositories/repository-client.type"

export async function findMemberRelationshipByIdRepository(
  relationshipId: string,
  db: RepositoryClient = prisma
) {
  return db.memberRelationship.findUnique({ where: { id: relationshipId } })
}
