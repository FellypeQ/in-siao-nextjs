import { findUserPermissionsByUserIdRepository } from "@/modules/usuarios/repositories/find-user-permissions-by-user-id.repository";
import { PERMISSIONS, type PermissionKey } from "@/shared/constants/permissions";

export async function loadUserPermissionsService(
  userId: string,
): Promise<PermissionKey[]> {
  const permissions = await findUserPermissionsByUserIdRepository(userId);
  const validPermissions = new Set<string>(PERMISSIONS);

  return permissions.filter((permission): permission is PermissionKey =>
    validPermissions.has(permission),
  );
}
