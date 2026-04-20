import { describe, expect, it } from "vitest"
import { formatPhone } from "@/frontend/shared/utils/format-phone"

describe("formatPhone", () => {
  it("retorna string vazia para entrada vazia", () => {
    expect(formatPhone("")).toBe("")
  })

  it("formata 11 digitos como celular brasileiro", () => {
    expect(formatPhone("11999999999")).toBe("(11) 99999-9999")
  })

  it("formata 10 digitos como telefone fixo", () => {
    expect(formatPhone("1134567890")).toBe("(11) 3456-7890")
  })

  it("aplica mascara progressiva com 2 digitos", () => {
    expect(formatPhone("11")).toBe("(11")
  })

  it("aplica mascara progressiva com 6 digitos", () => {
    expect(formatPhone("119999")).toBe("(11) 9999")
  })

  it("ignora caracteres nao numericos na entrada", () => {
    expect(formatPhone("(11) 99999-9999")).toBe("(11) 99999-9999")
  })

  it("limita a 11 digitos", () => {
    expect(formatPhone("119999999991")).toBe("(11) 99999-9999")
  })
})
