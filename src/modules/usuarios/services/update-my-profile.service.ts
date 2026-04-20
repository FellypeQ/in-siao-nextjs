import { encryptSurname } from "@/lib/surname-crypto";
import { findUsuarioByIdRepository } from "@/modules/usuarios/repositories/find-usuario-by-id.repository";
import { updateUserProfileRepository } from "@/modules/usuarios/repositories/update-user-profile.repository";
import type { UpdateMyProfileInput } from "@/modules/usuarios/schemas/update-my-profile.schema";
import { AppError } from "@/shared/errors/app-error";

export async function updateMyProfileService(
  userId: string,
  input: UpdateMyProfileInput,
) {
  const user = await findUsuarioByIdRepository(userId);

  if (!user) {
    throw new AppError("Usuario nao encontrado", 404, "USER_NOT_FOUND");
  }

  await updateUserProfileRepository({
    userId,
    nome: input.nome.trim(),
    sobrenomeEncrypted: encryptSurname(input.sobrenome.trim()),
  });
}