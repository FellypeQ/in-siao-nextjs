import { describe, expect, it } from "vitest"

import { createVisitanteSchema } from "@/modules/visitantes/schemas/create-visitante.schema"

describe("createVisitanteSchema", () => {
  it("valida payload base com familiar", () => {
    const parsed = createVisitanteSchema.parse({
      name: "Maria Souza",
      birthDate: "1993-04-10",
      phone: "11999999999",
      baptized: false,
      actualChurch: "NONE",
      howKnow: "EVENT",
      prayText: "Orar pela minha familia",
      familyMembers: [
        {
          name: "Jose Souza",
          birthDate: "2015-01-01",
          relationshipType: "CHILD"
        }
      ]
    })

    expect(parsed.name).toBe("Maria Souza")
    expect(parsed.familyMembers).toHaveLength(1)
  })

  it("rejeita when howKnow OTHER sem resposta", () => {
    const result = createVisitanteSchema.safeParse({
      name: "Maria Souza",
      birthDate: "1993-04-10",
      baptized: false,
      actualChurch: "NONE",
      howKnow: "OTHER",
      familyMembers: []
    })

    expect(result.success).toBe(false)
  })
})
