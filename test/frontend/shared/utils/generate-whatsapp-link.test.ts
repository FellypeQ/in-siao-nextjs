import { describe, expect, it } from "vitest"

import { generateWhatsAppLink } from "@/frontend/shared/utils/generate-whatsapp-link"

describe("generateWhatsAppLink", () => {
  it("preserva emojis e quebras de linha no parametro text", () => {
    const message = "Ola 😊\nTudo bem? 🙏"

    const link = generateWhatsAppLink("55 (11) 99999-9999", message)
    const parsed = new URL(link)

    expect(parsed.host).toBe("api.whatsapp.com")
    expect(parsed.pathname).toBe("/send/")
    expect(parsed.searchParams.get("phone")).toBe("5511999999999")
    expect(parsed.searchParams.get("text")).toBe(message)
  })
})
