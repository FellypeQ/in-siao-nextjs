import type { MemberType } from "@prisma/client"

import { prisma } from "@/lib/prisma"
import type { RepositoryClient } from "@/modules/visitantes/repositories/repository-client.type"

type CreateMemberRepositoryInput = {
  name: string
  birthDate: Date
  document?: string
  phone?: string
  baptized: boolean
  type?: MemberType
}

export async function createMemberRepository(
  input: CreateMemberRepositoryInput,
  db: RepositoryClient = prisma
) {
  return db.member.create({
    data: {
      name: input.name,
      birthDate: input.birthDate,
      document: input.document,
      phone: input.phone,
      baptized: input.baptized,
      type: input.type ?? "VISITOR"
    }
  })
}
