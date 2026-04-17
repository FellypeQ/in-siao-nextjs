import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { beforeEach, describe, expect, it, vi } from "vitest"

import { LoginPageView } from "@/frontend/features/auth/components/login-page-view"

const mockPush = vi.fn()
const mockRefresh = vi.fn()

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush, refresh: mockRefresh })
}))

function renderLogin(search = "") {
  Object.defineProperty(window, "location", {
    value: { search },
    writable: true
  })
  return render(<LoginPageView />)
}

describe("LoginPageView", () => {
  beforeEach(() => {
    vi.resetAllMocks()
    global.fetch = vi.fn()
  })

  it("renderiza campos de e-mail e senha", () => {
    renderLogin()

    expect(screen.getByPlaceholderText(/igrejasiao/i)).toBeInTheDocument()
    expect(screen.getByPlaceholderText("••••••••")).toBeInTheDocument()
  })

  it("renderiza botão de submit", () => {
    renderLogin()
    expect(screen.getByRole("button", { name: /entrar/i })).toBeInTheDocument()
  })

  it("exibe alerta de sucesso quando status=invite-sign-up-success", async () => {
    renderLogin("?status=invite-sign-up-success")

    await waitFor(() => {
      expect(screen.getByRole("alert")).toHaveTextContent(/conta criada com sucesso/i)
    })
  })

  it("não exibe alerta de sucesso sem o parâmetro de URL", async () => {
    renderLogin()

    await waitFor(() => {
      expect(screen.queryByText(/conta criada com sucesso/i)).not.toBeInTheDocument()
    })
  })

  it("exibe spinner de loading durante o envio e desabilita o botão", async () => {
    vi.mocked(global.fetch).mockImplementation(
      () => new Promise(() => {}) // nunca resolve
    )

    const user = userEvent.setup()
    renderLogin()

    await user.type(screen.getByPlaceholderText(/igrejasiao/i), "user@test.com")
    await user.type(screen.getByPlaceholderText("••••••••"), "senha123")
    await user.click(screen.getByRole("button", { name: /entrar/i }))

    // após submit: botão contém spinner e fica desabilitado
    const progressbar = screen.getByRole("progressbar")
    expect(progressbar).toBeInTheDocument()
    expect(progressbar.closest("button")).toBeDisabled()
  })

  it("exibe mensagem de erro quando credenciais são inválidas", async () => {
    vi.mocked(global.fetch).mockResolvedValue({
      ok: false,
      json: async () => ({ success: false, error: { message: "Credenciais invalidas" } })
    } as Response)

    const user = userEvent.setup()
    renderLogin()

    await user.type(screen.getByPlaceholderText(/igrejasiao/i), "wrong@test.com")
    await user.type(screen.getByPlaceholderText("••••••••"), "errada")
    await user.click(screen.getByRole("button", { name: /entrar/i }))

    await waitFor(() => {
      expect(screen.getByRole("alert")).toHaveTextContent(/credenciais invalidas/i)
    })
  })

  it("redireciona para '/' após login com sucesso", async () => {
    vi.mocked(global.fetch).mockResolvedValue({
      ok: true,
      json: async () => ({ success: true })
    } as Response)

    const user = userEvent.setup()
    renderLogin()

    await user.type(screen.getByPlaceholderText(/igrejasiao/i), "admin@test.com")
    await user.type(screen.getByPlaceholderText("••••••••"), "correta123")
    await user.click(screen.getByRole("button", { name: /entrar/i }))

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/")
      expect(mockRefresh).toHaveBeenCalled()
    })
  })

  it("envia email e senha corretos no payload do fetch", async () => {
    vi.mocked(global.fetch).mockResolvedValue({
      ok: true,
      json: async () => ({ success: true })
    } as Response)

    const user = userEvent.setup()
    renderLogin()

    await user.type(screen.getByPlaceholderText(/igrejasiao/i), "admin@siao.com")
    await user.type(screen.getByPlaceholderText("••••••••"), "senha-segura")
    await user.click(screen.getByRole("button", { name: /entrar/i }))

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        "/api/auth/sign-in",
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify({ email: "admin@siao.com", senha: "senha-segura" })
        })
      )
    })
  })
})
