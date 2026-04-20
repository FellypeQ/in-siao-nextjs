import { describe, expect, it } from "vitest"

import { requestPasswordResetSchema } from "@/modules/auth/schemas/request-password-reset.schema"

describe("requestPasswordResetSchema", () => {
  it("aceita email válido", () => {
    const result = requestPasswordResetSchema.safeParse({ email: "teste@exemplo.com" })
    expect(result.success).toBe(true)
  })

  it("rejeita email inválido", () => {
    const result = requestPasswordResetSchema.safeParse({ email: "nao-e-um-email" })
    expect(result.success).toBe(false)
  })

  it("rejeita campo vazio", () => {
    const result = requestPasswordResetSchema.safeParse({ email: "" })
    expect(result.success).toBe(false)
  })

  it("rejeita ausência do campo email", () => {
    const result = requestPasswordResetSchema.safeParse({})
    expect(result.success).toBe(false)
  })
})
