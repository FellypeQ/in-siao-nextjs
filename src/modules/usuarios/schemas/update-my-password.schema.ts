import { z } from "zod";

export const updateMyPasswordSchema = z
  .object({
    senhaAtual: z.string().min(1, "Informe a senha atual"),
    novaSenha: z
      .string()
      .min(8, "Mínimo 8 caracteres")
      .regex(/[A-Z]/, "Pelo menos uma letra maiúscula")
      .regex(/[a-z]/, "Pelo menos uma letra minúscula")
      .regex(/[0-9]/, "Pelo menos um número")
      .regex(/[^A-Za-z0-9]/, "Pelo menos um caractere especial"),
    confirmacaoNovaSenha: z.string(),
  })
  .refine((data) => data.novaSenha === data.confirmacaoNovaSenha, {
    message: "As senhas não coincidem",
    path: ["confirmacaoNovaSenha"],
  });

export type UpdateMyPasswordInput = z.infer<typeof updateMyPasswordSchema>;