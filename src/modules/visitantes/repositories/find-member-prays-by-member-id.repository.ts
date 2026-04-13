import { prisma } from "@/lib/prisma"
import type { RepositoryClient } from "@/modules/visitantes/repositories/repository-client.type"

export async function findMemberPraysByMemberIdRepository(
  memberId: string,
  db: RepositoryClient = prisma
) {
  return db.memberPray.findMany({ where: { memberId } })
}
