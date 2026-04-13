import { prisma } from "@/lib/prisma"
import type { RepositoryClient } from "@/modules/visitantes/repositories/repository-client.type"

export async function deletePraysByIdsRepository(prayIds: string[], db: RepositoryClient = prisma) {
  if (prayIds.length === 0) {
    return { count: 0 }
  }

  return db.pray.deleteMany({
    where: {
      id: {
        in: prayIds
      }
    }
  })
}
