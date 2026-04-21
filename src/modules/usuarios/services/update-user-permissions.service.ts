import { prisma } from "@/lib/prisma";
import { findPerfilByIdRepository } from "@/modules/perfis/repositories/find-perfil-by-id.repository";
import { findUsuarioByIdRepository } from "@/modules/usuarios/repositories/find-usuario-by-id.repository";
import { recomputeUserPermissionsRepository } from "@/modules/usuarios/repositories/recompute-user-permissions.repository";
import { replaceUserManualPermissionsRepository } from "@/modules/usuarios/repositories/replace-user-manual-permissions.repository";
import { replaceUserProfileAssignmentsRepository } from "@/modules/usuarios/repositories/replace-user-profile-assignments.repository";
import type { PermissionKey } from "@/shared/constants/permissions";
import { AppError } from "@/shared/errors/app-error";

type UpdateUserPermissionsServiceInput = {
  userId: string;
  profileIds: string[];
  manualPermissions: PermissionKey[];
};

export async function updateUserPermissionsService(
  input: UpdateUserPermissionsServiceInput,
) {
  const user = await findUsuarioByIdRepository(input.userId);

  if (!user) {
    throw new AppError("Usuario nao encontrado", 404, "USER_NOT_FOUND");
  }

  for (const profileId of input.profileIds) {
    const perfil = await findPerfilByIdRepository(profileId);

    if (!perfil) {
      throw new AppError(
        `Perfil ${profileId} nao encontrado`,
        400,
        "PERFIL_NAO_ENCONTRADO",
      );
    }
  }

  await prisma.$transaction(async (tx) => {
    await replaceUserProfileAssignmentsRepository(input.userId, input.profileIds, tx);
    await replaceUserManualPermissionsRepository(input.userId, input.manualPermissions, tx);
    await recomputeUserPermissionsRepository(input.userId, tx);
  });

  return { success: true };
}
