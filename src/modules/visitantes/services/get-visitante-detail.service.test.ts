import { beforeEach, describe, expect, it, vi } from "vitest"

import { getVisitanteDetailService } from "@/modules/visitantes/services/get-visitante-detail.service"
import { AppError } from "@/shared/errors/app-error"

const findVisitanteByIdRepositoryMock = vi.fn()

vi.mock("@/modules/visitantes/repositories/find-visitante-by-id.repository", () => ({
  findVisitanteByIdRepository: (id: string) => findVisitanteByIdRepositoryMock(id)
}))

describe("getVisitanteDetailService", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("retorna detalhe quando visitante existe", async () => {
    findVisitanteByIdRepositoryMock.mockResolvedValueOnce({
      id: "member-1",
      name: "Maria",
      birthDate: new Date("1990-01-01"),
      document: null,
      phone: null,
      type: "VISITOR",
      baptized: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      visitorProfile: {
        actualChurch: "NONE",
        howKnow: "EVENT",
        howKnowOtherAnswer: null
      },
      memberPrays: [],
      principalRelations: []
    })

    const result = await getVisitanteDetailService("member-1")

    expect(result.member.id).toBe("member-1")
  })

  it("lanca erro quando visitante nao existe", async () => {
    findVisitanteByIdRepositoryMock.mockResolvedValueOnce(null)

    await expect(getVisitanteDetailService("x")).rejects.toBeInstanceOf(AppError)
  })
})
