import { z } from "zod"

export const signInSchema = z.object({
  email: z.email("Email invalido").transform((value) => value.trim().toLowerCase()),
  senha: z.string().min(1, "Senha e obrigatoria")
})

export type SignInInput = z.infer<typeof signInSchema>
