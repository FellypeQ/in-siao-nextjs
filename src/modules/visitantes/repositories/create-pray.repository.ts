import { prisma } from "@/lib/prisma"
import type { RepositoryClient } from "@/modules/visitantes/repositories/repository-client.type"

type CreatePrayRepositoryInput = {
  text: string
}

export async function createPrayRepository(
  input: CreatePrayRepositoryInput,
  db: RepositoryClient = prisma
) {
  return db.pray.create({
    data: {
      text: input.text
    }
  })
}
