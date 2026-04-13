import { prisma } from "@/lib/prisma"
import type { RepositoryClient } from "@/modules/visitantes/repositories/repository-client.type"

type UpdateMemberRepositoryInput = {
  id: string
  name: string
  birthDate: Date
  document?: string
  phone?: string
  baptized: boolean
}

export async function updateMemberRepository(
  input: UpdateMemberRepositoryInput,
  db: RepositoryClient = prisma
) {
  return db.member.update({
    where: { id: input.id },
    data: {
      name: input.name,
      birthDate: input.birthDate,
      document: input.document,
      phone: input.phone,
      baptized: input.baptized,
      type: "VISITOR"
    }
  })
}
