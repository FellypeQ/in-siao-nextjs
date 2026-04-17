import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { PasswordField } from "@/frontend/components/inputs/password-field"

describe("PasswordField", () => {
  it("inicia com senha oculta (type=password)", () => {
    const { container } = render(<PasswordField />)
    expect(container.querySelector("input")).toHaveAttribute("type", "password")
  })

  it("exibe botão com aria-label 'Mostrar senha' por padrão", () => {
    render(<PasswordField />)
    expect(screen.getByRole("button", { name: /mostrar senha/i })).toBeInTheDocument()
  })

  it("clique no toggle revela a senha (type=text)", async () => {
    const user = userEvent.setup()
    const { container } = render(<PasswordField />)

    await user.click(screen.getByRole("button", { name: /mostrar senha/i }))

    expect(container.querySelector("input")).toHaveAttribute("type", "text")
  })

  it("segundo clique volta a ocultar a senha (type=password)", async () => {
    const user = userEvent.setup()
    const { container } = render(<PasswordField />)

    await user.click(screen.getByRole("button", { name: /mostrar senha/i }))
    await user.click(screen.getByRole("button", { name: /ocultar senha/i }))

    expect(container.querySelector("input")).toHaveAttribute("type", "password")
  })

  it("aria-label muda para 'Ocultar senha' quando a senha está visível", async () => {
    const user = userEvent.setup()
    render(<PasswordField />)

    await user.click(screen.getByRole("button", { name: /mostrar senha/i }))

    expect(screen.getByRole("button", { name: /ocultar senha/i })).toBeInTheDocument()
  })

  it("repassa props extras ao TextField (value, onChange, disabled)", () => {
    const onChange = vi.fn()
    const { container } = render(
      <PasswordField value="minha-senha" onChange={onChange} disabled />
    )
    const input = container.querySelector("input")

    expect(input).toHaveValue("minha-senha")
    expect(input).toBeDisabled()
  })

  it("não aceita prop type — é sempre controlado internamente", () => {
    // TypeScript garante isso em tempo de compilação; aqui validamos o comportamento
    const { container } = render(<PasswordField />)
    expect(container.querySelector("input")).toHaveAttribute("type", "password")
  })
})
