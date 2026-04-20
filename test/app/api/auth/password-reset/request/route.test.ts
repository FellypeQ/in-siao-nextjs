import { beforeEach, describe, expect, it, vi } from "vitest"

import { POST } from "@/app/api/auth/password-reset/request/route"
import { AppError } from "@/shared/errors/app-error"

vi.mock("@/modules/auth/services/request-password-reset.service", () => ({
  requestPasswordResetService: vi.fn()
}))
vi.mock("@/lib/rate-limiter", () => ({
  checkRateLimit: vi.fn().mockReturnValue({ allowed: true })
}))

import { requestPasswordResetService } from "@/modules/auth/services/request-password-reset.service"
import { checkRateLimit } from "@/lib/rate-limiter"

function makeRequest(body: unknown, ip = "127.0.0.1") {
  return new Request("http://localhost/api/auth/password-reset/request", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-forwarded-for": ip
    },
    body: JSON.stringify(body)
  })
}

describe("POST /api/auth/password-reset/request", () => {
  beforeEach(() => {
    vi.resetAllMocks()
    vi.mocked(checkRateLimit).mockReturnValue({ allowed: true })
  })

  it("retorna 200 com mensagem genérica para email existente", async () => {
    vi.mocked(requestPasswordResetService).mockResolvedValue(undefined)

    const response = await POST(makeRequest({ email: "teste@exemplo.com" }))
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body.success).toBe(true)
    expect(body.message).toBeDefined()
  })

  it("retorna 200 com mensagem genérica mesmo para email inexistente (não vaza existência)", async () => {
    vi.mocked(requestPasswordResetService).mockResolvedValue(undefined)

    const response = await POST(makeRequest({ email: "naoexiste@exemplo.com" }))
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body.success).toBe(true)
  })

  it("retorna 400 para email inválido", async () => {
    const response = await POST(makeRequest({ email: "nao-e-email" }))
    const body = await response.json()

    expect(response.status).toBe(400)
    expect(body.success).toBe(false)
    expect(body.error.code).toBe("VALIDATION_ERROR")
  })

  it("retorna 429 quando rate limit é excedido", async () => {
    vi.mocked(checkRateLimit).mockReturnValue({ allowed: false, retryAfter: 900 })

    const response = await POST(makeRequest({ email: "teste@exemplo.com" }))
    const body = await response.json()

    expect(response.status).toBe(429)
    expect(body.error.code).toBe("RATE_LIMIT")
  })

  it("retorna 500 para erro interno inesperado", async () => {
    vi.mocked(requestPasswordResetService).mockRejectedValue(new Error("db error"))

    const response = await POST(makeRequest({ email: "teste@exemplo.com" }))

    expect(response.status).toBe(500)
  })

  it("contrato de autorização: rota pública — sem guard de sessão", async () => {
    vi.mocked(requestPasswordResetService).mockResolvedValue(undefined)

    // Requisição sem nenhum cookie de sessão deve funcionar normalmente
    const request = new Request("http://localhost/api/auth/password-reset/request", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "teste@exemplo.com" })
    })
    const response = await POST(request)

    expect(response.status).toBe(200)
  })
})
