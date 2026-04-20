import { beforeEach, describe, expect, it, vi } from "vitest"

import { findRelatedMemberIdsRepository } from "@/modules/visitantes/repositories/find-related-member-ids.repository"

const findManyMock = vi.fn()

vi.mock("@/lib/prisma", () => ({
  prisma: {
    memberRelationship: {
      findMany: (...args: unknown[]) => findManyMock(...args)
    }
  }
}))

describe("findRelatedMemberIdsRepository", () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  it("retorna ids unicos de familiares relacionados ao principal", async () => {
    findManyMock.mockResolvedValueOnce([
      { relatedMemberId: "member-1" },
      { relatedMemberId: "member-1" },
      { relatedMemberId: "member-2" }
    ])

    const result = await findRelatedMemberIdsRepository("member-principal")

    expect(findManyMock).toHaveBeenCalledWith({
      where: { principalMemberId: "member-principal" },
      select: { relatedMemberId: true }
    })
    expect(result).toEqual(["member-1", "member-2"])
  })

  it("retorna array vazio quando nao ha familiares", async () => {
    findManyMock.mockResolvedValueOnce([])

    const result = await findRelatedMemberIdsRepository("member-principal")

    expect(result).toEqual([])
  })
})
