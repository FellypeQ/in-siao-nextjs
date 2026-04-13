import { describe, expect, it } from "vitest"

import { signUpSchema } from "@/modules/auth/schemas/sign-up.schema"

describe("signUpSchema", () => {
  it("valida payload com senha forte e normaliza email", () => {
    const parsed = signUpSchema.parse({
      nome: "Joao",
      sobrenome: "Silva",
      email: "  JOAO@EXAMPLE.COM  ",
      senha: "Senha@123"
    })

    expect(parsed.email).toBe("joao@example.com")
  })

  it("rejeita senha fraca", () => {
    const result = signUpSchema.safeParse({
      nome: "Joao",
      sobrenome: "Silva",
      email: "joao@example.com",
      senha: "12345678"
    })

    expect(result.success).toBe(false)
  })
})
