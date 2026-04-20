import { beforeEach, describe, expect, it, vi } from "vitest"

import { POST } from "@/app/api/auth/password-reset/confirm/route"
import { AppError } from "@/shared/errors/app-error"

vi.mock("@/modules/auth/services/confirm-password-reset.service", () => ({
  confirmPasswordResetService: vi.fn()
}))

import { confirmPasswordResetService } from "@/modules/auth/services/confirm-password-reset.service"

const validBody = {
  token: "valid-token",
  password: "Senha@123",
  confirmPassword: "Senha@123"
}

function makeRequest(body: unknown) {
  return new Request("http://localhost/api/auth/password-reset/confirm", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  })
}

describe("POST /api/auth/password-reset/confirm", () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  it("retorna 200 em sucesso com token e senha válidos", async () => {
    vi.mocked(confirmPasswordResetService).mockResolvedValue(undefined)

    const response = await POST(makeRequest(validBody))
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body.success).toBe(true)
  })

  it("retorna 400 para token inválido ou expirado", async () => {
    vi.mocked(confirmPasswordResetService).mockRejectedValue(
      new AppError("Link inválido ou expirado.", 400, "INVALID_RESET_TOKEN")
    )

    const response = await POST(makeRequest(validBody))
    const body = await response.json()

    expect(response.status).toBe(400)
    expect(body.error.code).toBe("INVALID_RESET_TOKEN")
    expect(body.error.message).toContain("inválido ou expirado")
  })

  it("retorna 400 para validação de schema — senhas não coincidem", async () => {
    const response = await POST(makeRequest({ ...validBody, confirmPassword: "Diferente@123" }))
    const body = await response.json()

    expect(response.status).toBe(400)
    expect(body.error.code).toBe("VALIDATION_ERROR")
  })

  it("retorna 400 para senha fraca", async () => {
    const response = await POST(makeRequest({ ...validBody, password: "fraca", confirmPassword: "fraca" }))
    const body = await response.json()

    expect(response.status).toBe(400)
    expect(body.error.code).toBe("VALIDATION_ERROR")
  })

  it("retorna 400 para token vazio", async () => {
    const response = await POST(makeRequest({ ...validBody, token: "" }))
    const body = await response.json()

    expect(response.status).toBe(400)
  })

  it("contrato de autorização: rota pública — sem guard de sessão", async () => {
    vi.mocked(confirmPasswordResetService).mockResolvedValue(undefined)

    const response = await POST(makeRequest(validBody))

    expect(response.status).toBe(200)
  })
})
