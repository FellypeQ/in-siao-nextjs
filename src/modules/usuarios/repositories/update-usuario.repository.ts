import { prisma } from "@/lib/prisma";

type UpdateUsuarioRepositoryInput = {
  id: string;
  nome?: string;
  sobrenomeEncrypted?: string;
  email?: string;
  role?: "ADMIN" | "STAFF";
};

export async function updateUsuarioRepository(
  input: UpdateUsuarioRepositoryInput,
) {
  return prisma.user.update({
    where: { id: input.id },
    data: {
      nome: input.nome,
      sobrenomeEncrypted: input.sobrenomeEncrypted,
      email: input.email,
      role: input.role,
    },
  });
}
