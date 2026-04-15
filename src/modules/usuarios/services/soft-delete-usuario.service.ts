import { countActiveAdminsRepository } from "@/modules/usuarios/repositories/count-active-admins.repository";
import { findUsuarioByIdRepository } from "@/modules/usuarios/repositories/find-usuario-by-id.repository";
import { softDeleteUsuarioRepository } from "@/modules/usuarios/repositories/soft-delete-usuario.repository";
import { AppError } from "@/shared/errors/app-error";

type SoftDeleteUsuarioServiceInput = {
  id: string;
  actorId: string;
};

export async function softDeleteUsuarioService(
  input: SoftDeleteUsuarioServiceInput,
) {
  if (input.id === input.actorId) {
    throw new AppError(
      "Nao e permitido excluir o proprio usuario",
      400,
      "SELF_DELETE_FORBIDDEN",
    );
  }

  const user = await findUsuarioByIdRepository(input.id);

  if (!user) {
    throw new AppError("Usuario nao encontrado", 404, "USER_NOT_FOUND");
  }

  if (user.deletedAt) {
    return { success: true };
  }

  if (user.role === "ADMIN") {
    const activeAdmins = await countActiveAdminsRepository();

    if (activeAdmins <= 1) {
      throw new AppError(
        "Nao e permitido excluir o ultimo ADMIN do sistema",
        400,
        "LAST_ADMIN_PROTECTION",
      );
    }
  }

  await softDeleteUsuarioRepository(input.id);

  return { success: true };
}
