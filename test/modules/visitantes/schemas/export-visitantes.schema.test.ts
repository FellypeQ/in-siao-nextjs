import { describe, expect, it } from "vitest"

import { exportVisitantesSchema } from "@/modules/visitantes/schemas/export-visitantes.schema"

describe("exportVisitantesSchema", () => {
  it("aceita filtros vazios", () => {
    const parsed = exportVisitantesSchema.safeParse({})

    expect(parsed.success).toBe(true)
  })

  it("rejeita intervalo invertido", () => {
    const parsed = exportVisitantesSchema.safeParse({
      createdFrom: "2026-04-20",
      createdTo: "2026-04-10"
    })

    expect(parsed.success).toBe(false)
  })
})
