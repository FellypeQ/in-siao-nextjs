import { z } from "zod";

import { PERMISSIONS } from "@/shared/constants/permissions";

export const createPerfilSchema = z.object({
  nome: z.string().trim().min(1).max(100),
  permissions: z.array(z.enum(PERMISSIONS)),
});

export type CreatePerfilInput = z.output<typeof createPerfilSchema>;
