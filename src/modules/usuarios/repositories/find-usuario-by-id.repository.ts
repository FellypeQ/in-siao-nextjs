import { prisma } from "@/lib/prisma";

type UsuarioEntity = {
  id: string;
  nome: string;
  sobrenomeEncrypted: string;
  email: string;
  passwordHash: string;
  role: "ADMIN" | "STAFF" | "MASTER";
  deletedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

export async function findUsuarioByIdRepository(id: string) {
  const user = await prisma.user.findUnique({ where: { id } });

  if (!user) {
    return null;
  }

  return user as UsuarioEntity;
}
