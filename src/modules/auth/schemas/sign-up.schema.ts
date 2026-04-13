import { z } from "zod"

const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/

export const signUpSchema = z.object({
  nome: z.string().trim().min(2, "Nome precisa ter ao menos 2 caracteres"),
  sobrenome: z.string().trim().min(2, "Sobrenome precisa ter ao menos 2 caracteres"),
  email: z
    .string()
    .trim()
    .email("Email invalido")
    .transform((value) => value.toLowerCase()),
  senha: z
    .string()
    .regex(
      strongPasswordRegex,
      "A senha deve ter no minimo 8 caracteres, incluindo maiuscula, minuscula, numero e simbolo"
    )
})

export type SignUpInput = z.infer<typeof signUpSchema>
