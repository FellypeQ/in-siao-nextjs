import { prisma } from "@/lib/prisma";
import type { CreatePerfilInput } from "@/modules/perfis/schemas/create-perfil.schema";

export async function createPerfilRepository(data: CreatePerfilInput) {
  return prisma.userProfile.create({
    data: {
      nome: data.nome,
      permissions: data.permissions,
    },
  });
}
