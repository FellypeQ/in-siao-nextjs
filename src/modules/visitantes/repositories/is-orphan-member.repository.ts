import { prisma } from "@/lib/prisma"
import type { RepositoryClient } from "@/modules/visitantes/repositories/repository-client.type"

export async function isOrphanMemberRepository(
  memberId: string,
  db: RepositoryClient = prisma
) {
  // A nocao de orfao e regra de negocio (perfil de visitante + vinculos restantes), nao regra de FK.
  const [visitorProfile, relationshipCount] = await Promise.all([
    db.memberVisitor.findUnique({
      where: { memberId },
      select: { memberId: true }
    }),
    db.memberRelationship.count({
      where: {
        OR: [{ principalMemberId: memberId }, { relatedMemberId: memberId }]
      }
    })
  ])

  return !visitorProfile && relationshipCount === 0
}
