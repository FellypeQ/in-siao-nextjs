import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { beforeEach, describe, expect, it, vi } from "vitest"

import { ResetPasswordView } from "@/frontend/features/auth/components/reset-password-view"

const mockPush = vi.fn()

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush, refresh: vi.fn() })
}))

describe("ResetPasswordView", () => {
  beforeEach(() => {
    vi.resetAllMocks()
    global.fetch = vi.fn()
    Object.defineProperty(window, "location", {
      value: { search: "?token=test-token-123" },
      writable: true
    })
  })

  it("renderiza campos de nova senha e confirmação quando token está presente", () => {
    render(<ResetPasswordView />)

    expect(screen.getAllByPlaceholderText(/••••••••/)).toHaveLength(2)
    expect(screen.getByRole("button", { name: /redefinir senha/i })).toBeInTheDocument()
  })

  it("exibe erro de link expirado quando não há token na URL", async () => {
    Object.defineProperty(window, "location", {
      value: { search: "" },
      writable: true
    })

    render(<ResetPasswordView />)

    await waitFor(() => {
      expect(screen.getByRole("alert")).toBeInTheDocument()
    })
    expect(screen.getByRole("alert").textContent).toMatch(/inválido ou expirado/i)
  })

  it("exibe botão de solicitar novo link quando não há token", async () => {
    Object.defineProperty(window, "location", {
      value: { search: "" },
      writable: true
    })

    render(<ResetPasswordView />)

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /solicitar novo link/i })).toBeInTheDocument()
    })
  })

  it("redireciona para /login?status=password-reset-success após sucesso", async () => {
    vi.mocked(global.fetch).mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ success: true })
    } as Response)

    const user = userEvent.setup()
    render(<ResetPasswordView />)

    const passwordFields = screen.getAllByPlaceholderText(/••••••••/)
    await user.type(passwordFields[0], "Senha@123")
    await user.type(passwordFields[1], "Senha@123")
    await user.click(screen.getByRole("button", { name: /redefinir senha/i }))

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/login?status=password-reset-success")
    })
  })

  it("exibe erro quando API retorna token inválido ou expirado", async () => {
    vi.mocked(global.fetch).mockResolvedValue({
      ok: false,
      status: 400,
      json: async () => ({
        success: false,
        error: { code: "INVALID_RESET_TOKEN", message: "Link inválido ou expirado." }
      })
    } as Response)

    const user = userEvent.setup()
    render(<ResetPasswordView />)

    const passwordFields = screen.getAllByPlaceholderText(/••••••••/)
    await user.type(passwordFields[0], "Senha@123")
    await user.type(passwordFields[1], "Senha@123")
    await user.click(screen.getByRole("button", { name: /redefinir senha/i }))

    await waitFor(() => {
      expect(screen.getByRole("alert")).toBeInTheDocument()
    })
    expect(screen.getByRole("alert").textContent).toMatch(/inválido ou expirado/i)
  })

  it("exibe erro quando senhas não coincidem no cliente", async () => {
    const user = userEvent.setup()
    render(<ResetPasswordView />)

    const passwordFields = screen.getAllByPlaceholderText(/••••••••/)
    await user.type(passwordFields[0], "Senha@123")
    await user.type(passwordFields[1], "Diferente@456")
    await user.click(screen.getByRole("button", { name: /redefinir senha/i }))

    await waitFor(() => {
      expect(screen.getByRole("alert")).toBeInTheDocument()
    })
    expect(screen.getByRole("alert").textContent).toMatch(/não coincidem/i)

    expect(global.fetch).not.toHaveBeenCalled()
  })

  it("exibe checklist de regras de senha", () => {
    render(<ResetPasswordView />)

    expect(screen.getByText(/regras da senha/i)).toBeInTheDocument()
  })
})
