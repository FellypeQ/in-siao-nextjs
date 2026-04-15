import { z } from "zod";

import type { UpdateUsuarioInput } from "@/modules/usuarios/types/usuario.type";

export const updateUsuarioSchema = z
  .object({
    nome: z.string().trim().min(2).max(100).optional(),
    sobrenome: z.string().trim().min(2).max(100).optional(),
    email: z.string().trim().email().optional(),
    role: z.enum(["ADMIN", "STAFF"]).optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "Informe ao menos um campo para atualizacao",
  }) satisfies z.ZodType<UpdateUsuarioInput>;

export type UpdateUsuarioSchemaInput = z.input<typeof updateUsuarioSchema>;
export type UpdateUsuarioSchemaOutput = z.output<typeof updateUsuarioSchema>;
