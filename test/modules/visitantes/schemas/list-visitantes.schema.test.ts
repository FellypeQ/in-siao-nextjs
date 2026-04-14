import { describe, expect, it } from "vitest"

import { listVisitantesSchema } from "@/modules/visitantes/schemas/list-visitantes.schema"

describe("listVisitantesSchema", () => {
  it("aplica valores padrao", () => {
    const parsed = listVisitantesSchema.parse({})

    expect(parsed.page).toBe(1)
    expect(parsed.limit).toBe(20)
  })

  it("rejeita limit acima do maximo", () => {
    const result = listVisitantesSchema.safeParse({ page: 1, limit: 100 })

    expect(result.success).toBe(false)
  })

  it("aceita intervalo de criacao valido", () => {
    const parsed = listVisitantesSchema.safeParse({
      page: 1,
      limit: 20,
      createdFrom: "2026-04-01",
      createdTo: "2026-04-14"
    })

    expect(parsed.success).toBe(true)
  })

  it("rejeita intervalo de criacao invertido", () => {
    const parsed = listVisitantesSchema.safeParse({
      page: 1,
      limit: 20,
      createdFrom: "2026-04-20",
      createdTo: "2026-04-14"
    })

    expect(parsed.success).toBe(false)
  })
})
