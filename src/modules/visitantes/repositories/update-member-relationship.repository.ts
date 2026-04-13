import type { RelationshipType } from "@prisma/client"

import { prisma } from "@/lib/prisma"
import type { RepositoryClient } from "@/modules/visitantes/repositories/repository-client.type"

type UpdateMemberRelationshipRepositoryInput = {
  id: string
  relationshipType: RelationshipType
}

export async function updateMemberRelationshipRepository(
  input: UpdateMemberRelationshipRepositoryInput,
  db: RepositoryClient = prisma
) {
  return db.memberRelationship.update({
    where: { id: input.id },
    data: { relationshipType: input.relationshipType }
  })
}
