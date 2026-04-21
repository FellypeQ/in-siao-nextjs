import { prisma } from "@/lib/prisma";
import type { UpdatePerfilInput } from "@/modules/perfis/schemas/update-perfil.schema";

export async function updatePerfilRepository(id: string, data: UpdatePerfilInput) {
  return prisma.userProfile.update({
    where: { id },
    data: {
      nome: data.nome,
      permissions: data.permissions,
    },
  });
}
