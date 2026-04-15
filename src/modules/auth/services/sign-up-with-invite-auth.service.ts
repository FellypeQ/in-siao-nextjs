import { hash } from "bcryptjs"

import { prisma } from "@/lib/prisma"
import { encryptSurname } from "@/lib/surname-crypto"
import { createUserRepository } from "@/modules/auth/repositories/create-user.repository"
import { findUserByEmailRepository } from "@/modules/auth/repositories/find-user-by-email.repository"
import type { SignUpInput } from "@/modules/auth/schemas/sign-up.schema"
import type { PublicUser } from "@/modules/auth/types/auth.type"
import { findUserInviteByTokenRepository } from "@/modules/usuarios/repositories/find-user-invite-by-token.repository"
import { useUserInviteRepository } from "@/modules/usuarios/repositories/use-user-invite.repository"
import { AppError } from "@/shared/errors/app-error"

export async function signUpWithInviteAuthService(input: SignUpInput): Promise<PublicUser> {
  const email = input.email.trim().toLowerCase()

  const existingUser = await findUserByEmailRepository(email)

  if (existingUser) {
    throw new AppError("Email ja cadastrado", 409, "EMAIL_ALREADY_EXISTS")
  }

  const passwordHash = await hash(input.senha, 12)
  const sobrenomeEncrypted = encryptSurname(input.sobrenome.trim())

  const createdUser = await prisma.$transaction(async (tx) => {
    const invite = await findUserInviteByTokenRepository(
      {
        token: input.token,
        availableOnly: true
      },
      tx
    )

    if (!invite) {
      throw new AppError("Token invalido ou ja utilizado", 400, "INVALID_INVITE_TOKEN")
    }

    const user = await createUserRepository(
      {
        nome: input.nome.trim(),
        sobrenomeEncrypted,
        email,
        passwordHash,
        role: invite.role
      },
      tx
    )

    const inviteUsageCount = await useUserInviteRepository(
      {
        token: invite.token,
        usedById: user.id
      },
      tx
    )

    if (inviteUsageCount === 0) {
      throw new AppError("Token invalido ou ja utilizado", 400, "INVALID_INVITE_TOKEN")
    }

    return user
  })

  return {
    id: createdUser.id,
    nome: createdUser.nome,
    email: createdUser.email,
    role: createdUser.role
  }
}
