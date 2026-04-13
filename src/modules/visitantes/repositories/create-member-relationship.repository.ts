import type { RelationshipType } from "@prisma/client"

import { prisma } from "@/lib/prisma"
import type { RepositoryClient } from "@/modules/visitantes/repositories/repository-client.type"

type CreateMemberRelationshipRepositoryInput = {
  principalMemberId: string
  relatedMemberId: string
  relationshipType: RelationshipType
}

export async function createMemberRelationshipRepository(
  input: CreateMemberRelationshipRepositoryInput,
  db: RepositoryClient = prisma
) {
  return db.memberRelationship.create({
    data: {
      principalMemberId: input.principalMemberId,
      relatedMemberId: input.relatedMemberId,
      relationshipType: input.relationshipType
    }
  })
}
