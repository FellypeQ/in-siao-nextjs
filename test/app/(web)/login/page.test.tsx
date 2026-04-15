import { render, screen } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"

import LoginPage from "@/app/(web)/login/page"

const pushMock = vi.fn()
const refreshMock = vi.fn()

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: pushMock,
    refresh: refreshMock
  }),
  useSearchParams: () => ({
    get: () => null
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

  it("nao exibe opcao de cadastro publico", () => {
    render(<LoginPage />)

    expect(screen.queryByRole("tab", { name: "Cadastro" })).not.toBeInTheDocument()
    expect(screen.queryByRole("button", { name: "Criar cadastro" })).not.toBeInTheDocument()
  })
})
