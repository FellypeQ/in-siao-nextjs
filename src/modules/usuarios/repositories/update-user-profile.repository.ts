import { prisma } from "@/lib/prisma";

type UpdateUserProfileRepositoryInput = {
  userId: string;
  nome: string;
  sobrenomeEncrypted: string;
};

export async function updateUserProfileRepository(
  input: UpdateUserProfileRepositoryInput,
) {
  await prisma.user.update({
    where: { id: input.userId },
    data: {
      nome: input.nome,
      sobrenomeEncrypted: input.sobrenomeEncrypted,
    },
  });
}