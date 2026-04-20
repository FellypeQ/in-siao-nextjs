import { beforeEach, describe, expect, it, vi } from "vitest"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { useState } from "react"
import { PhoneField } from "@/frontend/components/inputs/phone-field"

function ControlledPhoneField({ initialValue = "" }: { initialValue?: string }) {
  const [value, setValue] = useState(initialValue)
  return <PhoneField label="Telefone" value={value} onChange={setValue} />
}

describe("PhoneField", () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  it("exibe campo vazio sem erros", () => {
    render(<PhoneField label="Telefone" value="" onChange={vi.fn()} />)
    expect(screen.getByLabelText(/telefone/i)).toBeInTheDocument()
  })

  it("exibe valor com mascara aplicada para 11 digitos", () => {
    render(<PhoneField label="Telefone" value="11999999999" onChange={vi.fn()} />)
    const input = screen.getByLabelText(/telefone/i) as HTMLInputElement
    expect(input.value).toBe("(11) 99999-9999")
  })

  it("exibe string vazia quando value esta vazio", () => {
    render(<PhoneField label="Telefone" value="" onChange={vi.fn()} />)
    const input = screen.getByLabelText(/telefone/i) as HTMLInputElement
    expect(input.value).toBe("")
  })

  it("onChange entrega apenas digitos ao digitar", async () => {
    const user = userEvent.setup()
    render(<ControlledPhoneField />)
    const input = screen.getByLabelText(/telefone/i) as HTMLInputElement
    await user.type(input, "11999999999")
    expect(input.value).toBe("(11) 99999-9999")
  })

  it("mascara e aplicada progressivamente durante digitacao", async () => {
    const user = userEvent.setup()
    render(<ControlledPhoneField />)
    const input = screen.getByLabelText(/telefone/i) as HTMLInputElement
    await user.type(input, "11")
    expect(input.value).toBe("(11")
  })
})
