import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { beforeEach, describe, expect, it, vi } from "vitest"

import { VisitanteForm } from "@/modules/visitantes/components/visitante-form"

const pushMock = vi.fn()
const refreshMock = vi.fn()

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: pushMock,
    refresh: refreshMock
  })
}))

describe("VisitanteForm", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("renderiza campos principais no modo create", () => {
    render(<VisitanteForm mode="create" />)

    expect(screen.getByRole("heading", { name: "Cadastrar visitante" })).toBeInTheDocument()
    expect(screen.getByRole("textbox", { name: /Nome completo/i })).toBeInTheDocument()
    expect(screen.getByRole("combobox", { name: /Batizado\?/i })).toBeInTheDocument()
  })

  it("adiciona bloco de familiar", async () => {
    const user = userEvent.setup()

    render(<VisitanteForm mode="create" />)

    await user.click(screen.getByRole("button", { name: "Adicionar membro familiar" }))

    expect(screen.getByText("Familiar 1")).toBeInTheDocument()
  })
})
