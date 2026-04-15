import { findUsuarioByIdRepository } from "@/modules/usuarios/repositories/find-usuario-by-id.repository";
import { replaceUserPermissionsRepository } from "@/modules/usuarios/repositories/replace-user-permissions.repository";
import type { PermissionKey } from "@/shared/constants/permissions";
import { AppError } from "@/shared/errors/app-error";

export async function updateUserPermissionsService(
  userId: string,
  permissions: PermissionKey[],
) {
  const user = await findUsuarioByIdRepository(userId);

  if (!user) {
    throw new AppError("Usuario nao encontrado", 404, "USER_NOT_FOUND");
  }

  await replaceUserPermissionsRepository(userId, permissions);

  return { success: true };
}
