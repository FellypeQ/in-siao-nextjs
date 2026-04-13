import { hash } from "bcryptjs"

import { encryptSurname } from "@/lib/surname-crypto"
import { createUserRepository } from "@/modules/auth/repositories/create-user.repository"
import { findUserByEmailRepository } from "@/modules/auth/repositories/find-user-by-email.repository"
import type { SignUpInput } from "@/modules/auth/schemas/sign-up.schema"
import type { PublicUser } from "@/modules/auth/types/auth.type"
import { AppError } from "@/shared/errors/app-error"

export async function signUpAuthService(input: SignUpInput): Promise<PublicUser> {
  const email = input.email.trim().toLowerCase()
  const existingUser = await findUserByEmailRepository(email)

  if (existingUser) {
    throw new AppError("Email ja cadastrado", 409, "EMAIL_ALREADY_EXISTS")
  }

  const passwordHash = await hash(input.senha, 12)
  const sobrenomeEncrypted = encryptSurname(input.sobrenome.trim())

  const user = await createUserRepository({
    nome: input.nome.trim(),
    sobrenomeEncrypted,
    email,
    passwordHash
  })

  return {
    id: user.id,
    nome: user.nome,
    email: user.email,
    role: user.role
  }
}
