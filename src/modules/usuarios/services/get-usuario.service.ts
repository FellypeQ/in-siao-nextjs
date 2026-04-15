import { decryptSurname } from "@/lib/surname-crypto";
import { findUsuarioByIdRepository } from "@/modules/usuarios/repositories/find-usuario-by-id.repository";
import type { UsuarioPublic } from "@/modules/usuarios/types/usuario.type";
import { AppError } from "@/shared/errors/app-error";

export async function getUsuarioService(id: string): Promise<UsuarioPublic> {
  const user = await findUsuarioByIdRepository(id);

  if (!user) {
    throw new AppError("Usuario nao encontrado", 404, "USER_NOT_FOUND");
  }

  return {
    id: user.id,
    nome: user.nome,
    sobrenome: decryptSurname(user.sobrenomeEncrypted),
    email: user.email,
    role: user.role,
    status: user.deletedAt ? "INATIVO" : "ATIVO",
    deletedAt: user.deletedAt,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}
