import { z } from "zod";

import { PERMISSIONS } from "@/shared/constants/permissions";

export const updatePerfilSchema = z
  .object({
    nome: z.string().trim().min(1).max(100).optional(),
    permissions: z.array(z.enum(PERMISSIONS)).optional(),
  })
  .refine((data) => data.nome !== undefined || data.permissions !== undefined, {
    message: "Informe ao menos um campo para atualizacao",
  });

export type UpdatePerfilInput = z.output<typeof updatePerfilSchema>;
