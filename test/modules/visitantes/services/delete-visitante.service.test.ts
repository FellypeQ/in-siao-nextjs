import { beforeEach, describe, expect, it, vi } from "vitest"
import { deleteVisitanteService } from "@/modules/visitantes/services/delete-visitante.service"
import { AppError } from "@/shared/errors/app-error"

const findVisitanteByIdMock = vi.fn()
const findRelatedMemberIdsMock = vi.fn()
const isOrphanMemberMock = vi.fn()
const deleteMemberMock = vi.fn()
const transactionMock = vi.fn()

vi.mock("@/lib/prisma", () => ({
  prisma: {
    $transaction: (callback: (tx: object) => Promise<unknown>) => transactionMock(callback)
  }
}))

vi.mock("@/modules/visitantes/repositories/find-visitante-by-id.repository", () => ({
  findVisitanteByIdRepository: (id: string) => findVisitanteByIdMock(id)
}))

vi.mock("@/modules/visitantes/repositories/find-related-member-ids.repository", () => ({
  findRelatedMemberIdsRepository: (id: string) => findRelatedMemberIdsMock(id)
}))

vi.mock("@/modules/visitantes/repositories/is-orphan-member.repository", () => ({
  isOrphanMemberRepository: (memberId: string, db: object) => isOrphanMemberMock(memberId, db)
}))

vi.mock("@/modules/visitantes/repositories/delete-member.repository", () => ({
  deleteMemberRepository: (memberId: string, db: object) => deleteMemberMock(memberId, db)
}))

describe("deleteVisitanteService", () => {
  beforeEach(() => {
    vi.resetAllMocks()
    transactionMock.mockImplementation(async (callback: (tx: object) => Promise<unknown>) => {
      const tx = { kind: "transaction-client" }
      return callback(tx)
    })
  })

  it("exclui visitante existente e retorna sucesso", async () => {
    findVisitanteByIdMock.mockResolvedValueOnce({ id: "member-1" })
    findRelatedMemberIdsMock.mockResolvedValueOnce([])
    deleteMemberMock.mockResolvedValue(undefined)

    const result = await deleteVisitanteService("member-1")

    expect(result).toEqual({ success: true })
    expect(deleteMemberMock).toHaveBeenCalledTimes(1)
    expect(findRelatedMemberIdsMock).toHaveBeenCalledWith("member-1")
  })

  it("lanca AppError 404 quando visitante nao encontrado", async () => {
    findVisitanteByIdMock.mockResolvedValueOnce(null)

    await expect(deleteVisitanteService("id-inexistente")).rejects.toThrow(AppError)
    expect(findRelatedMemberIdsMock).not.toHaveBeenCalled()
    expect(deleteMemberMock).not.toHaveBeenCalled()
  })

  it("nao inicia transacao quando visitante nao existe", async () => {
    findVisitanteByIdMock.mockResolvedValueOnce(null)

    await expect(deleteVisitanteService("id-inexistente")).rejects.toMatchObject({
      statusCode: 404,
      code: "VISITANTE_NOT_FOUND"
    })
    expect(transactionMock).not.toHaveBeenCalled()
  })

  it("exclui membro principal e familiar orfao", async () => {
    findVisitanteByIdMock.mockResolvedValueOnce({ id: "member-principal" })
    findRelatedMemberIdsMock.mockResolvedValueOnce(["member-related-1"])
    isOrphanMemberMock.mockResolvedValueOnce(true)
    deleteMemberMock.mockResolvedValue(undefined)

    await deleteVisitanteService("member-principal")

    expect(deleteMemberMock).toHaveBeenNthCalledWith(1, "member-principal", { kind: "transaction-client" })
    expect(isOrphanMemberMock).toHaveBeenCalledWith("member-related-1", { kind: "transaction-client" })
    expect(deleteMemberMock).toHaveBeenNthCalledWith(2, "member-related-1", { kind: "transaction-client" })
  })

  it("mantem familiar quando nao esta orfao", async () => {
    findVisitanteByIdMock.mockResolvedValueOnce({ id: "member-principal" })
    findRelatedMemberIdsMock.mockResolvedValueOnce(["member-related-1"])
    isOrphanMemberMock.mockResolvedValueOnce(false)
    deleteMemberMock.mockResolvedValue(undefined)

    await deleteVisitanteService("member-principal")

    expect(deleteMemberMock).toHaveBeenCalledTimes(1)
    expect(deleteMemberMock).toHaveBeenCalledWith("member-principal", { kind: "transaction-client" })
  })

  it("nao avalia orfao quando nao ha familiares relacionados", async () => {
    findVisitanteByIdMock.mockResolvedValueOnce({ id: "member-principal" })
    findRelatedMemberIdsMock.mockResolvedValueOnce([])
    deleteMemberMock.mockResolvedValue(undefined)

    await deleteVisitanteService("member-principal")

    expect(isOrphanMemberMock).not.toHaveBeenCalled()
  })
})
