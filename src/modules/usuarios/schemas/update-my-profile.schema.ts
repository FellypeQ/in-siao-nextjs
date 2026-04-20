import { z } from "zod";

export const updateMyProfileSchema = z.object({
  nome: z
    .string()
    .trim()
    .min(2, "Nome deve ter pelo menos 2 caracteres")
    .max(100, "Nome deve ter no maximo 100 caracteres"),
  sobrenome: z
    .string()
    .trim()
    .min(2, "Sobrenome deve ter pelo menos 2 caracteres")
    .max(100, "Sobrenome deve ter no maximo 100 caracteres"),
});

export type UpdateMyProfileInput = z.infer<typeof updateMyProfileSchema>;