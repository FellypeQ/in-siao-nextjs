import { beforeEach, describe, expect, it, vi } from "vitest"

import { isOrphanMemberRepository } from "@/modules/visitantes/repositories/is-orphan-member.repository"

const findUniqueMemberVisitorMock = vi.fn()
const countMemberRelationshipMock = vi.fn()

vi.mock("@/lib/prisma", () => ({
  prisma: {
    memberVisitor: {
      findUnique: (...args: unknown[]) => findUniqueMemberVisitorMock(...args)
    },
    memberRelationship: {
      count: (...args: unknown[]) => countMemberRelationshipMock(...args)
    }
  }
}))

describe("isOrphanMemberRepository", () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  it("retorna true quando membro nao possui visitor profile e nao possui vinculos", async () => {
    findUniqueMemberVisitorMock.mockResolvedValueOnce(null)
    countMemberRelationshipMock.mockResolvedValueOnce(0)

    const result = await isOrphanMemberRepository("member-1")

    expect(result).toBe(true)
  })

  it("retorna false quando membro possui visitor profile", async () => {
    findUniqueMemberVisitorMock.mockResolvedValueOnce({ memberId: "member-1" })
    countMemberRelationshipMock.mockResolvedValueOnce(0)

    const result = await isOrphanMemberRepository("member-1")

    expect(result).toBe(false)
  })

  it("retorna false quando membro possui outros vinculos", async () => {
    findUniqueMemberVisitorMock.mockResolvedValueOnce(null)
    countMemberRelationshipMock.mockResolvedValueOnce(1)

    const result = await isOrphanMemberRepository("member-1")

    expect(result).toBe(false)
  })
})
