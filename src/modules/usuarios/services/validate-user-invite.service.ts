import { findUserInviteByTokenRepository } from "@/modules/usuarios/repositories/find-user-invite-by-token.repository";
import type { UserInviteValidationResult } from "@/modules/usuarios/types/user-invite.type";

export async function validateUserInviteService(
  token: string,
): Promise<UserInviteValidationResult> {
  const invite = await findUserInviteByTokenRepository({
    token,
    availableOnly: true,
  });

  if (!invite) {
    return { valid: false };
  }

  return {
    valid: true,
    role: invite.role,
  };
}
