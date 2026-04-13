import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { beforeEach, describe, expect, it, vi } from "vitest"

import LoginPage from "@/app/login/page"

const pushMock = vi.fn()
const refreshMock = vi.fn()

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: pushMock,
    refresh: refreshMock
  })
}))

describe("LoginPage", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("renderiza modo login por padrao", () => {
    render(<LoginPage />)

    expect(screen.getByRole("heading", { name: "Acesso ao sistema" })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Entrar" })).toBeInTheDocument()
  })

  it("alterna para cadastro e exibe campos adicionais", async () => {
    const user = userEvent.setup()

    render(<LoginPage />)

    await user.click(screen.getByRole("tab", { name: "Cadastro" }))

    expect(screen.getByRole("button", { name: "Criar cadastro" })).toBeInTheDocument()
    expect(screen.getByText("Nome")).toBeInTheDocument()
    expect(screen.getByText("Sobrenome")).toBeInTheDocument()
  })
})
