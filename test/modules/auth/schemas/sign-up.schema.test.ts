import { describe, expect, it } from "vitest"

import { getPasswordRulesStatus, signUpSchema } from "@/modules/auth/schemas/sign-up.schema"

describe("signUpSchema", () => {
  it("valida payload com senha forte e normaliza email", () => {
    const parsed = signUpSchema.parse({
      nome: "Joao",
      sobrenome: "Silva",
      email: "  JOAO@EXAMPLE.COM  ",
      senha: "Senha@123",
      token: "ec5f18d3-7a17-44be-ac55-150f7f75a95d"
    })

    expect(parsed.email).toBe("joao@example.com")
  })

  it("rejeita senha fraca", () => {
    const result = signUpSchema.safeParse({
      nome: "Joao",
      sobrenome: "Silva",
      email: "joao@example.com",
      senha: "12345678",
      token: "ec5f18d3-7a17-44be-ac55-150f7f75a95d"
    })

    expect(result.success).toBe(false)
  })

  it("expõe status por criterio para feedback visual", () => {
    const status = getPasswordRulesStatus("Senha@123")

    expect(status.every((item) => item.met)).toBe(true)
  })

  it("rejeita payload sem token de convite", () => {
    const result = signUpSchema.safeParse({
      nome: "Joao",
      sobrenome: "Silva",
      email: "joao@example.com",
      senha: "Senha@123"
    })

    expect(result.success).toBe(false)
  })
})
