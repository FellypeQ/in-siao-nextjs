import { prisma } from "@/lib/prisma"
import type { RepositoryClient } from "@/modules/visitantes/repositories/repository-client.type"

export async function deleteMemberRepository(memberId: string, db: RepositoryClient = prisma) {
  return db.member.delete({ where: { id: memberId } })
}
