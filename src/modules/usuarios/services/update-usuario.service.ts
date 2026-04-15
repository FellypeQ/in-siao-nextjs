import { encryptSurname } from "@/lib/surname-crypto";
import { countActiveAdminsRepository } from "@/modules/usuarios/repositories/count-active-admins.repository";
import { findUsuarioByEmailRepository } from "@/modules/usuarios/repositories/find-usuario-by-email.repository";
import { findUsuarioByIdRepository } from "@/modules/usuarios/repositories/find-usuario-by-id.repository";
import { updateUsuarioRepository } from "@/modules/usuarios/repositories/update-usuario.repository";
import type { UpdateUsuarioInput } from "@/modules/usuarios/types/usuario.type";
import { AppError } from "@/shared/errors/app-error";

type UpdateUsuarioServiceInput = {
  id: string;
  data: UpdateUsuarioInput;
  actorId: string;
};

export async function updateUsuarioService(input: UpdateUsuarioServiceInput) {
  const currentUser = await findUsuarioByIdRepository(input.id);

  if (!currentUser) {
    throw new AppError("Usuario nao encontrado", 404, "USER_NOT_FOUND");
  }

  if (currentUser.deletedAt) {
    throw new AppError(
      "Usuario inativo nao pode ser editado",
      400,
      "INACTIVE_USER",
    );
  }

  if (
    input.data.role &&
    input.actorId === currentUser.id &&
    input.data.role !== currentUser.role
  ) {
    throw new AppError(
      "Nao e permitido alterar o proprio papel",
      400,
      "SELF_ROLE_UPDATE_FORBIDDEN",
    );
  }

  if (input.data.email) {
    const nextEmail = input.data.email.trim().toLowerCase();
    const duplicatedEmailUser = await findUsuarioByEmailRepository(nextEmail);

    if (duplicatedEmailUser && duplicatedEmailUser.id !== currentUser.id) {
      throw new AppError("Email ja cadastrado", 409, "EMAIL_ALREADY_EXISTS");
    }
  }

  if (currentUser.role === "ADMIN" && input.data.role === "STAFF") {
    const activeAdmins = await countActiveAdminsRepository();

    if (activeAdmins <= 1) {
      throw new AppError(
        "Nao e permitido rebaixar o ultimo ADMIN do sistema",
        400,
        "LAST_ADMIN_PROTECTION",
      );
    }
  }

  return updateUsuarioRepository({
    id: currentUser.id,
    nome: input.data.nome?.trim(),
    sobrenomeEncrypted: input.data.sobrenome
      ? encryptSurname(input.data.sobrenome.trim())
      : undefined,
    email: input.data.email?.trim().toLowerCase(),
    role: input.data.role,
  });
}
