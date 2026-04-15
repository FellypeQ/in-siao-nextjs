import { createUserInviteRepository } from "@/modules/usuarios/repositories/create-user-invite.repository";
import type { GenerateUserInviteInput } from "@/modules/usuarios/types/user-invite.type";

function normalizeBaseUrl(appUrl: string): string {
  return appUrl.replace(/\/+$/, "");
}

export async function generateUserInviteService(input: GenerateUserInviteInput) {
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
