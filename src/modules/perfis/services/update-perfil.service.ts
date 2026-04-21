import { findPerfilByIdRepository } from "@/modules/perfis/repositories/find-perfil-by-id.repository";
import { findPerfilByNomeRepository } from "@/modules/perfis/repositories/find-perfil-by-nome.repository";
import { updatePerfilRepository } from "@/modules/perfis/repositories/update-perfil.repository";
import { findUsersByProfileRepository } from "@/modules/perfis/repositories/find-users-by-profile.repository";
import type { UpdatePerfilInput } from "@/modules/perfis/schemas/update-perfil.schema";
import { recomputeUserPermissionsRepository } from "@/modules/usuarios/repositories/recompute-user-permissions.repository";
import { AppError } from "@/shared/errors/app-error";

export async function updatePerfilService(id: string, data: UpdatePerfilInput) {
  const perfil = await findPerfilByIdRepository(id);

  if (!perfil) {
    throw new AppError("Perfil nao encontrado", 404, "PERFIL_NAO_ENCONTRADO");
  }

  if (data.nome && data.nome !== perfil.nome) {
    const existing = await findPerfilByNomeRepository(data.nome);

    if (existing) {
      throw new AppError("Ja existe um perfil com este nome", 400, "NOME_JA_EXISTE");
    }
  }

  const affectedUserIds = await findUsersByProfileRepository(id);

  await updatePerfilRepository(id, data);

  for (const userId of affectedUserIds) {
    await recomputeUserPermissionsRepository(userId);
  }

  return findPerfilByIdRepository(id);
}
