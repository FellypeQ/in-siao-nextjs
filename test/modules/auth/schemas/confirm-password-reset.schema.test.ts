import { describe, expect, it } from "vitest"

import { confirmPasswordResetSchema } from "@/modules/auth/schemas/confirm-password-reset.schema"

const validData = {
  token: "some-uuid-token",
  password: "Senha@123",
  confirmPassword: "Senha@123"
}

describe("confirmPasswordResetSchema", () => {
  it("aceita dados válidos", () => {
    const result = confirmPasswordResetSchema.safeParse(validData)
    expect(result.success).toBe(true)
  })

  it("rejeita quando senhas não coincidem", () => {
    const result = confirmPasswordResetSchema.safeParse({
      ...validData,
      confirmPassword: "OutraSenha@123"
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.flatten().fieldErrors.confirmPassword).toBeDefined()
    }
  })

  it("rejeita senha com menos de 8 caracteres", () => {
    const result = confirmPasswordResetSchema.safeParse({
      ...validData,
      password: "Ab@1",
      confirmPassword: "Ab@1"
    })
    expect(result.success).toBe(false)
  })

  it("rejeita senha sem letra maiúscula", () => {
    const result = confirmPasswordResetSchema.safeParse({
      ...validData,
      password: "senha@123",
      confirmPassword: "senha@123"
    })
    expect(result.success).toBe(false)
  })

  it("rejeita senha sem caractere especial", () => {
    const result = confirmPasswordResetSchema.safeParse({
      ...validData,
      password: "SenhaSem1",
      confirmPassword: "SenhaSem1"
    })
    expect(result.success).toBe(false)
  })

  it("rejeita token vazio", () => {
    const result = confirmPasswordResetSchema.safeParse({ ...validData, token: "" })
    expect(result.success).toBe(false)
  })
})
