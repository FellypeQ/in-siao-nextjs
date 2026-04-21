export type UsuarioRole = "ADMIN" | "STAFF" | "MASTER";

export type UsuarioPublic = {
  id: string;
  nome: string;
  sobrenome: string;
  email: string;
  role: UsuarioRole;
  status: "ATIVO" | "INATIVO";
  deletedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

export type UpdateUsuarioInput = {
  nome?: string;
  sobrenome?: string;
  email?: string;
  role?: UsuarioRole;
};
