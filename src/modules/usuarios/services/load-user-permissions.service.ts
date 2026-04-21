import { findUserManualPermissionsRepository } from "@/modules/usuarios/repositories/find-user-manual-permissions.repository";
import { findUserProfileAssignmentsRepository } from "@/modules/usuarios/repositories/find-user-profile-assignments.repository";
import { PERMISSIONS, type PermissionKey } from "@/shared/constants/permissions";

const validPermissions = new Set<string>(PERMISSIONS);

export async function loadUserPermissionsService(userId: string) {
  const [manualRows, assignments] = await Promise.all([
    findUserManualPermissionsRepository(userId),
    findUserProfileAssignmentsRepository(userId),
  ]);

  const manualPermissions = manualRows.filter(
    (p): p is PermissionKey => validPermissions.has(p),
  );

  const assignedProfiles = assignments.map((a) => ({
    id: a.profile.id,
    nome: a.profile.nome,
    permissions: a.profile.permissions.filter(
      (p): p is PermissionKey => validPermissions.has(p),
    ),
  }));

  return { assignedProfiles, manualPermissions };
}
