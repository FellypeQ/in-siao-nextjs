import { z } from "zod"

export const signInSchema = z.object({
  email: z
    .string()
    .trim()
    .email("Email invalido")
    .transform((value) => value.toLowerCase()),
  senha: z.string().min(1, "Senha e obrigatoria")
})

export type SignInInput = z.infer<typeof signInSchema>
