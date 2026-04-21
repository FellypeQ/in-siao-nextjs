import { findPerfilByIdRepository } from "@/modules/perfis/repositories/find-perfil-by-id.repository";
import type { PerfilPublic } from "@/modules/perfis/types/perfil.type";
import { PERMISSIONS, type PermissionKey } from "@/shared/constants/permissions";
import { AppError } from "@/shared/errors/app-error";

const validPermissions = new Set<string>(PERMISSIONS);

export async function getPerfilService(id: string): Promise<PerfilPublic> {
  const perfil = await findPerfilByIdRepository(id);

  if (!perfil) {
    throw new AppError("Perfil nao encontrado", 404, "PERFIL_NAO_ENCONTRADO");
  }

  return {
    id: perfil.id,
    nome: perfil.nome,
    permissions: perfil.permissions.filter((p): p is PermissionKey =>
      validPermissions.has(p),
    ),
    createdAt: perfil.createdAt,
    updatedAt: perfil.updatedAt,
  };
}
