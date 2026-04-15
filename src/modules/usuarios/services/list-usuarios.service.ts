import { decryptSurname } from "@/lib/surname-crypto";
import { listUsuariosRepository } from "@/modules/usuarios/repositories/list-usuarios.repository";
import type { UsuarioPublic } from "@/modules/usuarios/types/usuario.type";

function toUsuarioPublic(user: {
  id: string;
  nome: string;
  sobrenomeEncrypted: string;
  email: string;
  role: "ADMIN" | "STAFF";
  deletedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}): UsuarioPublic {
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

export async function listUsuariosService() {
  const users = await listUsuariosRepository();

  return users.map(toUsuarioPublic);
}
