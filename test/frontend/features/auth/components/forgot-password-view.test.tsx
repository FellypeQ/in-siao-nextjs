import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { beforeEach, describe, expect, it, vi } from "vitest"

import { ForgotPasswordView } from "@/frontend/features/auth/components/forgot-password-view"

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), refresh: vi.fn() })
}))

describe("ForgotPasswordView", () => {
  beforeEach(() => {
    vi.resetAllMocks()
    global.fetch = vi.fn()
  })

  it("renderiza campo de email e botão de envio", () => {
    render(<ForgotPasswordView />)

    expect(screen.getByPlaceholderText(/igrejasiao/i)).toBeInTheDocument()
    expect(screen.getByRole("button", { name: /enviar link/i })).toBeInTheDocument()
  })

  it("renderiza link de voltar para o login", () => {
    render(<ForgotPasswordView />)

    expect(screen.getByText(/voltar para o login/i)).toBeInTheDocument()
  })

  it("exibe mensagem de sucesso após submit bem-sucedido", async () => {
    vi.mocked(global.fetch).mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ success: true, message: "Se o email existir..." })
    } as Response)

    const user = userEvent.setup()
    render(<ForgotPasswordView />)

    await user.type(screen.getByPlaceholderText(/igrejasiao/i), "teste@exemplo.com")
    await user.click(screen.getByRole("button", { name: /enviar link/i }))

    await waitFor(() => {
      expect(screen.getByRole("alert")).toBeInTheDocument()
    })
    expect(screen.getByRole("alert").textContent).toMatch(/receberá um link/i)
  })

  it("exibe mensagem de erro quando API retorna erro", async () => {
    vi.mocked(global.fetch).mockResolvedValue({
      ok: false,
      status: 500,
      json: async () => ({ success: false, error: { message: "Erro interno" } })
    } as Response)

    const user = userEvent.setup()
    render(<ForgotPasswordView />)

    await user.type(screen.getByPlaceholderText(/igrejasiao/i), "teste@exemplo.com")
    await user.click(screen.getByRole("button", { name: /enviar link/i }))

    await waitFor(() => {
      expect(screen.getByRole("alert")).toBeInTheDocument()
    })
    expect(screen.getByRole("alert").textContent).toMatch(/erro interno/i)
  })

  it("exibe mensagem de rate limit quando API retorna 429", async () => {
    vi.mocked(global.fetch).mockResolvedValue({
      ok: false,
      status: 429,
      json: async () => ({ error: { message: "Muitas tentativas. Tente novamente mais tarde." } })
    } as Response)

    const user = userEvent.setup()
    render(<ForgotPasswordView />)

    await user.type(screen.getByPlaceholderText(/igrejasiao/i), "teste@exemplo.com")
    await user.click(screen.getByRole("button", { name: /enviar link/i }))

    await waitFor(() => {
      expect(screen.getByRole("alert")).toBeInTheDocument()
    })
    expect(screen.getByRole("alert").textContent).toMatch(/muitas tentativas/i)
  })

  it("mostra estado de loading durante o submit", async () => {
    vi.mocked(global.fetch).mockImplementation(() => new Promise(() => {}))

    const user = userEvent.setup()
    render(<ForgotPasswordView />)

    await user.type(screen.getByPlaceholderText(/igrejasiao/i), "teste@exemplo.com")
    await user.click(screen.getByRole("button", { name: /enviar link/i }))

    expect(screen.getByRole("progressbar")).toBeInTheDocument()
  })

  it("exibe botão de voltar após sucesso", async () => {
    vi.mocked(global.fetch).mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ success: true })
    } as Response)

    const user = userEvent.setup()
    render(<ForgotPasswordView />)

    await user.type(screen.getByPlaceholderText(/igrejasiao/i), "teste@exemplo.com")
    await user.click(screen.getByRole("button", { name: /enviar link/i }))

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /voltar para o login/i })).toBeInTheDocument()
    })
  })
})
