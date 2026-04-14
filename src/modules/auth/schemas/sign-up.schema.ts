import { z } from "zod"

const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/

export type PasswordRule = {
  id: "minLength" | "upper" | "lower" | "number" | "special"
  label: string
  test: (value: string) => boolean
}

export const passwordRules: PasswordRule[] = [
  {
    id: "minLength",
    label: "No minimo 8 caracteres",
    test: (value) => value.length >= 8
  },
  {
    id: "upper",
    label: "Ao menos 1 letra maiuscula",
    test: (value) => /[A-Z]/.test(value)
  },
  {
    id: "lower",
    label: "Ao menos 1 letra minuscula",
    test: (value) => /[a-z]/.test(value)
  },
  {
    id: "number",
    label: "Ao menos 1 numero",
    test: (value) => /\d/.test(value)
  },
  {
    id: "special",
    label: "Ao menos 1 simbolo",
    test: (value) => /[^A-Za-z\d]/.test(value)
  }
]

export function getPasswordRulesStatus(password: string) {
  return passwordRules.map((rule) => ({
    id: rule.id,
    label: rule.label,
    met: rule.test(password)
  }))
}

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
