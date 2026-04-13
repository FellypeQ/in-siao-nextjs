import { prisma } from "@/lib/prisma"
import type { RepositoryClient } from "@/modules/visitantes/repositories/repository-client.type"

export async function ensureMemberVisitorProfileRepository(
  memberId: string,
  db: RepositoryClient = prisma
) {
  return db.memberVisitor.upsert({
    where: { memberId },
    update: {},
    create: {
      memberId,
      actualChurch: "NO_REPORT",
      howKnow: "OTHER"
    }
  })
}