import type { UsuarioRole } from "@/modules/usuarios/types/usuario.type";

export const ROLE_TRANSLATIONS: Record<UsuarioRole, string> = {
  ADMIN: "Administrador",
  STAFF: "Equipe",
  MASTER: "Master",
};
