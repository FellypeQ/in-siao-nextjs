import { deletePerfilRepository } from "@/modules/perfis/repositories/delete-perfil.repository";
import { findPerfilByIdRepository } from "@/modules/perfis/repositories/find-perfil-by-id.repository";
import { findUsersByProfileRepository } from "@/modules/perfis/repositories/find-users-by-profile.repository";
import { recomputeUserPermissionsRepository } from "@/modules/usuarios/repositories/recompute-user-permissions.repository";
import { AppError } from "@/shared/errors/app-error";

export async function deletePerfilService(id: string) {
  const perfil = await findPerfilByIdRepository(id);

  if (!perfil) {
    throw new AppError("Perfil nao encontrado", 404, "PERFIL_NAO_ENCONTRADO");
  }

  const affectedUserIds = await findUsersByProfileRepository(id);

  await deletePerfilRepository(id);

  for (const userId of affectedUserIds) {
    await recomputeUserPermissionsRepository(userId);
  }

  return { success: true };
}
