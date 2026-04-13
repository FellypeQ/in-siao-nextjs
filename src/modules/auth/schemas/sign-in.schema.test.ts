import { describe, expect, it } from "vitest"

import { signInSchema } from "@/modules/auth/schemas/sign-in.schema"

describe("signInSchema", () => {
  it("valida payload com email e senha", () => {
    const parsed = signInSchema.parse({
      email: "  USER@EXAMPLE.COM ",
      senha: "Senha@123"
    })

    expect(parsed.email).toBe("user@example.com")
  })

  it("rejeita email invalido", () => {
    const result = signInSchema.safeParse({
      email: "email-invalido",
      senha: "Senha@123"
    })

    expect(result.success).toBe(false)
  })
})
