import { z } from "zod";

import type { UserInviteRole } from "@/modules/usuarios/types/user-invite.type";

export const generateUserInviteSchema = z.object({
  role: z.enum(["ADMIN", "STAFF"]),
}) satisfies z.ZodType<{ role: UserInviteRole }>;

export type GenerateUserInviteSchemaInput = z.input<
  typeof generateUserInviteSchema
>;
export type GenerateUserInviteSchemaOutput = z.output<
  typeof generateUserInviteSchema
>;
