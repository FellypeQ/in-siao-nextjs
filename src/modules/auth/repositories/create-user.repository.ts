import { prisma } from "@/lib/prisma"

type CreateUserRepositoryInput = {
  nome: string
  sobrenomeEncrypted: string
  email: string
  passwordHash: string
}

export async function createUserRepository(input: CreateUserRepositoryInput) {
  return prisma.user.create({
    data: {
      nome: input.nome,
      sobrenomeEncrypted: input.sobrenomeEncrypted,
      email: input.email,
      passwordHash: input.passwordHash,
      role: "ADMIN"
    }
  })
}
