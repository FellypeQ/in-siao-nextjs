import { compare } from "bcryptjs";

import { createSessionToken } from "@/lib/auth";
import { findUserByEmailRepository } from "@/modules/auth/repositories/find-user-by-email.repository";
import type { SignInInput } from "@/modules/auth/schemas/sign-in.schema";
import type { SignInResult } from "@/modules/auth/types/auth.type";
import { AppError } from "@/shared/errors/app-error";

export async function signInAuthService(
  input: SignInInput,
): Promise<SignInResult> {
  const email = input.email.trim().toLowerCase();
  const user = await findUserByEmailRepository(email);

  if (!user) {
    throw new AppError("Credenciais invalidas", 401, "INVALID_CREDENTIALS");
  }

  const passwordIsValid = await compare(input.senha, user.passwordHash);

  if (!passwordIsValid) {
    throw new AppError("Credenciais invalidas", 401, "INVALID_CREDENTIALS");
  }

  if (user.deletedAt) {
    throw new AppError("Conta inativa", 401, "INACTIVE_ACCOUNT");
  }

  const token = await createSessionToken({
    id: user.id,
    nome: user.nome,
    email: user.email,
    role: user.role,
  });

  return {
    token,
    user: {
      id: user.id,
      nome: user.nome,
      email: user.email,
      role: user.role,
    },
  };
}
