import { describe, expect, it } from "vitest"

import {
  createMessageTemplateSchema,
  updateMessageTemplateSchema,
  logMensagemVisitanteSchema,
} from "@/modules/mensagens/schemas/message-template.schema"

describe("messageTemplateSchema", () => {
  it("valida create com payload correto", () => {
    const parsed = createMessageTemplateSchema.parse({
      title: "Boas-vindas",
      body: "Ola, {nome_do_visitante}!"
    })

    expect(parsed.title).toBe("Boas-vindas")
  })

  it("rejeita body acima de 4000 caracteres", () => {
    const result = createMessageTemplateSchema.safeParse({
      title: "Titulo",
      body: "a".repeat(4001)
    })

    expect(result.success).toBe(false)
  })

  it("rejeita order invalida no update", () => {
    const result = updateMessageTemplateSchema.safeParse({ order: 0 })

    expect(result.success).toBe(false)
  })

  it("rejeita titulo/body com caractere de substituicao", () => {
    const result = createMessageTemplateSchema.safeParse({
      title: "Boas-vindas �",
      body: "Mensagem com emoji corrompido �"
    })

    expect(result.success).toBe(false)
  })

  it("valida schema de log com messageTemplateId", () => {
    const parsed = logMensagemVisitanteSchema.parse({ messageTemplateId: "tpl-1" })

    expect(parsed.messageTemplateId).toBe("tpl-1")
  })
})
