import { beforeEach, describe, expect, it, vi } from "vitest"

import { deleteVisitanteRepository } from "@/modules/visitantes/repositories/delete-visitante.repository"

const findManyMemberRelationshipMock = vi.fn()
const countMemberRelationshipMock = vi.fn()
const deleteManyMemberMessageLogMock = vi.fn()
const findManyMemberPrayMock = vi.fn()
const deleteManyPrayMock = vi.fn()
const deleteMemberMock = vi.fn()

vi.mock("@/lib/prisma", () => ({
  prisma: {
    $transaction: async (callback: (tx: object) => unknown) =>
      callback({
        memberRelationship: {
          findMany: (...args: unknown[]) => findManyMemberRelationshipMock(...args),
          count: (...args: unknown[]) => countMemberRelationshipMock(...args),
        },
        memberMessageLog: {
          deleteMany: (...args: unknown[]) => deleteManyMemberMessageLogMock(...args),
        },
        memberPray: {
          findMany: (...args: unknown[]) => findManyMemberPrayMock(...args),
        },
        pray: {
          deleteMany: (...args: unknown[]) => deleteManyPrayMock(...args),
        },
        member: {
          delete: (...args: unknown[]) => deleteMemberMock(...args),
        },
      }),
  },
}))

describe("deleteVisitanteRepository", () => {
  beforeEach(() => {
    vi.clearAllMocks()

    findManyMemberRelationshipMock
      .mockResolvedValueOnce([{ relatedMemberId: "member-related-1" }])
      .mockResolvedValue([])

    countMemberRelationshipMock.mockResolvedValue(1)

    deleteManyMemberMessageLogMock.mockResolvedValue({ count: 0 })

    findManyMemberPrayMock.mockResolvedValue([])
    deleteManyPrayMock.mockResolvedValue({ count: 0 })

    deleteMemberMock.mockResolvedValue({})
  })

  it("exclui relatedMember orfao antes de excluir o visitante principal", async () => {
    await deleteVisitanteRepository("member-principal")

    expect(deleteMemberMock).toHaveBeenNthCalledWith(1, {
      where: { id: "member-related-1" },
    })
    expect(deleteMemberMock).toHaveBeenNthCalledWith(2, {
      where: { id: "member-principal" },
    })
  })

  it("nao exclui relatedMember quando ele possui outros relacionamentos", async () => {
    countMemberRelationshipMock.mockResolvedValue(2)

    await deleteVisitanteRepository("member-principal")

    expect(deleteMemberMock).toHaveBeenCalledTimes(1)
    expect(deleteMemberMock).toHaveBeenCalledWith({ where: { id: "member-principal" } })
  })
})
