export type SessionRole = "ADMIN" | "STAFF";

export type PublicUser = {
  id: string;
  nome: string;
  email: string;
  role: SessionRole;
};

export type SignInResult = {
  token: string;
  user: PublicUser;
};
