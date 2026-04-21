import { listPerfisRepository } from "@/modules/perfis/repositories/list-perfis.repository";
import type { PerfilListItem } from "@/modules/perfis/types/perfil.type";
import { PERMISSIONS, type PermissionKey } from "@/shared/constants/permissions";

const validPermissions = new Set<string>(PERMISSIONS);

export async function listPerfisService(): Promise<PerfilListItem[]> {
  const perfis = await listPerfisRepository();

  return perfis.map((p) => ({
    id: p.id,
    nome: p.nome,
    permissionsCount: p.permissions.filter((perm) => validPermissions.has(perm)).length,
    usersCount: p._count.assignments,
  }));
}
