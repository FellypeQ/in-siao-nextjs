import { createUserInviteRepository } from "@/modules/usuarios/repositories/create-user-invite.repository";
import type { GenerateUserInviteInput } from "@/modules/usuarios/types/user-invite.type";
import type { UsuarioRole } from "@/modules/usuarios/types/usuario.type";
import { AppError } from "@/shared/errors/app-error";

function normalizeBaseUrl(appUrl: string): string {
  return appUrl.replace(/\/+$/, "");
}

export async function generateUserInviteService(
  input: GenerateUserInviteInput,
  actorRole: UsuarioRole,
) {
  if (input.role === "MASTER" && actorRole !== "MASTER") {
    throw new AppError(
      "Sem permissao para convidar usuario Master",
      403,
      "FORBIDDEN",
    );
  }

  const token = crypto.randomUUID();

  await createUserInviteRepository({
    token,
    role: input.role,
    createdById: input.createdById,
  });

  const baseUrl = normalizeBaseUrl(input.appUrl);

  return {
    token,
    link: `${baseUrl}/cadastro?token=${token}`,
  };
}
