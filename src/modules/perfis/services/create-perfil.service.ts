import { createPerfilRepository } from "@/modules/perfis/repositories/create-perfil.repository";
import { findPerfilByNomeRepository } from "@/modules/perfis/repositories/find-perfil-by-nome.repository";
import type { CreatePerfilInput } from "@/modules/perfis/schemas/create-perfil.schema";
import { AppError } from "@/shared/errors/app-error";

export async function createPerfilService(data: CreatePerfilInput) {
  const existing = await findPerfilByNomeRepository(data.nome);

  if (existing) {
    throw new AppError("Ja existe um perfil com este nome", 400, "NOME_JA_EXISTE");
  }

  return createPerfilRepository(data);
}
