import { decryptSurname } from "@/lib/surname-crypto";
import { findUsuarioByIdRepository } from "@/modules/usuarios/repositories/find-usuario-by-id.repository";
import { AppError } from "@/shared/errors/app-error";

type MyProfileOutput = {
  id: string;
  nome: string;
  sobrenome: string;
  email: string;
  role: "ADMIN" | "STAFF";
};

export async function getMyProfileService(userId: string): Promise<MyProfileOutput> {
  const user = await findUsuarioByIdRepository(userId);

  if (!user) {
    throw new AppError("Usuario nao encontrado", 404, "USER_NOT_FOUND");
  }

  return {
    id: user.id,
    nome: user.nome,
    sobrenome: decryptSurname(user.sobrenomeEncrypted),
    email: user.email,
    role: user.role,
  };
}