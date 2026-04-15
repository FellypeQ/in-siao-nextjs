import { prisma } from "@/lib/prisma";

type UsuarioEntity = {
  id: string;
  nome: string;
  sobrenomeEncrypted: string;
  email: string;
  passwordHash: string;
  role: "ADMIN" | "STAFF";
  deletedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

export async function listUsuariosRepository() {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
  });

  return users as UsuarioEntity[];
}
