import { beforeEach, describe, expect, it, vi } from "vitest"

import { updateVisitanteService } from "@/modules/visitantes/services/update-visitante.service"
import { AppError } from "@/shared/errors/app-error"

const findVisitanteByIdRepositoryMock = vi.fn()
const updateMemberRepositoryMock = vi.fn()
const updateMemberVisitorRepositoryMock = vi.fn()
const findMemberPraysByMemberIdRepositoryMock = vi.fn()
const deleteMemberPraysByMemberIdRepositoryMock = vi.fn()
const deletePraysByIdsRepositoryMock = vi.fn()
const findMemberRelationshipByIdRepositoryMock = vi.fn()
const createMemberRepositoryMock = vi.fn()
const createMemberRelationshipRepositoryMock = vi.fn()

vi.mock("@/lib/prisma", () => ({
  prisma: {
    $transaction: async (callback: (tx: object) => unknown) => callback({})
  }
}))

vi.mock("@/modules/visitantes/repositories/find-visitante-by-id.repository", () => ({
  findVisitanteByIdRepository: (id: string) => findVisitanteByIdRepositoryMock(id)
}))

vi.mock("@/modules/visitantes/repositories/update-member.repository", () => ({
  updateMemberRepository: (...args: unknown[]) => updateMemberRepositoryMock(...args)
}))

vi.mock("@/modules/visitantes/repositories/update-member-visitor.repository", () => ({
  updateMemberVisitorRepository: (...args: unknown[]) => updateMemberVisitorRepositoryMock(...args)
}))

vi.mock("@/modules/visitantes/repositories/find-member-prays-by-member-id.repository", () => ({
  findMemberPraysByMemberIdRepository: (...args: unknown[]) =>
    findMemberPraysByMemberIdRepositoryMock(...args)
}))

vi.mock("@/modules/visitantes/repositories/delete-member-prays-by-member-id.repository", () => ({
  deleteMemberPraysByMemberIdRepository: (...args: unknown[]) =>
    deleteMemberPraysByMemberIdRepositoryMock(...args)
}))

vi.mock("@/modules/visitantes/repositories/delete-prays-by-ids.repository", () => ({
  deletePraysByIdsRepository: (...args: unknown[]) => deletePraysByIdsRepositoryMock(...args)
}))

vi.mock("@/modules/visitantes/repositories/find-member-relationship-by-id.repository", () => ({
  findMemberRelationshipByIdRepository: (...args: unknown[]) =>
    findMemberRelationshipByIdRepositoryMock(...args)
}))

vi.mock("@/modules/visitantes/repositories/create-member.repository", () => ({
  createMemberRepository: (...args: unknown[]) => createMemberRepositoryMock(...args)
}))

vi.mock("@/modules/visitantes/repositories/create-member-relationship.repository", () => ({
  createMemberRelationshipRepository: (...args: unknown[]) =>
    createMemberRelationshipRepositoryMock(...args)
}))

vi.mock("@/modules/visitantes/repositories/create-pray.repository", () => ({
  createPrayRepository: vi.fn()
}))

vi.mock("@/modules/visitantes/repositories/create-member-pray.repository", () => ({
  createMemberPrayRepository: vi.fn()
}))

vi.mock("@/modules/visitantes/repositories/delete-member-relationship.repository", () => ({
  deleteMemberRelationshipRepository: vi.fn()
}))

vi.mock("@/modules/visitantes/repositories/count-member-relationships-by-member-id.repository", () => ({
  countMemberRelationshipsByMemberIdRepository: vi.fn()
}))

vi.mock("@/modules/visitantes/repositories/delete-member.repository", () => ({
  deleteMemberRepository: vi.fn()
}))

vi.mock("@/modules/visitantes/repositories/update-member-relationship.repository", () => ({
  updateMemberRelationshipRepository: vi.fn()
}))

describe("updateVisitanteService", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    findMemberPraysByMemberIdRepositoryMock.mockResolvedValue([])
  })

  it("lanca erro quando visitante nao existe", async () => {
    findVisitanteByIdRepositoryMock.mockResolvedValueOnce(null)

    await expect(
      updateVisitanteService({
        id: "member-1",
        name: "Visitante",
        birthDate: new Date("1990-01-01"),
        baptized: false,
        actualChurch: "NONE",
        howKnow: "EVENT",
        familyOperations: []
      })
    ).rejects.toBeInstanceOf(AppError)
  })

  it("aplica operacao create para familiar", async () => {
    findVisitanteByIdRepositoryMock.mockResolvedValue({
      id: "member-1",
      visitorProfile: { id: "vp-1" }
    })
    updateMemberRepositoryMock.mockResolvedValue({ id: "member-1" })
    updateMemberVisitorRepositoryMock.mockResolvedValue({ id: "vp-1" })
    deleteMemberPraysByMemberIdRepositoryMock.mockResolvedValue({ count: 0 })
    deletePraysByIdsRepositoryMock.mockResolvedValue({ count: 0 })
    createMemberRepositoryMock.mockResolvedValue({ id: "member-family" })
    createMemberRelationshipRepositoryMock.mockResolvedValue({ id: "rel-1" })

    const result = await updateVisitanteService({
      id: "member-1",
      name: "Visitante",
      birthDate: new Date("1990-01-01"),
      baptized: true,
      actualChurch: "EVANGELICAL",
      howKnow: "EVENT",
      familyOperations: [
        {
          action: "create",
          payload: {
            name: "Filho",
            birthDate: new Date("2010-01-01"),
            relationshipType: "CHILD"
          }
        }
      ]
    })

    expect(createMemberRepositoryMock).toHaveBeenCalledTimes(1)
    expect(createMemberRelationshipRepositoryMock).toHaveBeenCalledTimes(1)
    expect(result.id).toBe("member-1")
  })
})
