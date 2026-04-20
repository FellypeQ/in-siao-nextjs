import { compare, hash } from "bcryptjs";

import { updateUserPasswordRepository } from "@/modules/auth/repositories/update-user-password.repository";
import { findUsuarioByIdRepository } from "@/modules/usuarios/repositories/find-usuario-by-id.repository";
import type { UpdateMyPasswordInput } from "@/modules/usuarios/schemas/update-my-password.schema";
import { AppError } from "@/shared/errors/app-error";

export async function updateMyPasswordService(
  userId: string,
  input: UpdateMyPasswordInput,
) {
  const user = await findUsuarioByIdRepository(userId);

  if (!user) {
    throw new AppError("Usuario nao encontrado", 404, "USER_NOT_FOUND");
  }

  const passwordIsValid = await compare(input.senhaAtual, user.passwordHash);

  if (!passwordIsValid) {
    throw new AppError("Senha atual incorreta", 400, "SENHA_ATUAL_INCORRETA");
  }

  const newPasswordHash = await hash(input.novaSenha, 12);
  await updateUserPasswordRepository(userId, newPasswordHash);
}