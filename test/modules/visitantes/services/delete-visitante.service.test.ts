import { beforeEach, describe, expect, it, vi } from "vitest"
import { deleteVisitanteService } from "@/modules/visitantes/services/delete-visitante.service"
import { AppError } from "@/shared/errors/app-error"

const findVisitanteByIdMock = vi.fn()
const deleteVisitanteMock = vi.fn()

vi.mock("@/modules/visitantes/repositories/find-visitante-by-id.repository", () => ({
  findVisitanteByIdRepository: (id: string) => findVisitanteByIdMock(id)
}))

vi.mock("@/modules/visitantes/repositories/delete-visitante.repository", () => ({
  deleteVisitanteRepository: (id: string) => deleteVisitanteMock(id)
}))

describe("deleteVisitanteService", () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  it("exclui visitante existente e retorna sucesso", async () => {
    findVisitanteByIdMock.mockResolvedValueOnce({ id: "member-1" })
    deleteVisitanteMock.mockResolvedValueOnce(undefined)

    const result = await deleteVisitanteService("member-1")

    expect(result).toEqual({ success: true })
    expect(deleteVisitanteMock).toHaveBeenCalledWith("member-1")
  })

  it("lanca AppError 404 quando visitante nao encontrado", async () => {
    findVisitanteByIdMock.mockResolvedValueOnce(null)

    await expect(deleteVisitanteService("id-inexistente")).rejects.toThrow(AppError)
    expect(deleteVisitanteMock).not.toHaveBeenCalled()
  })

  it("nao chama deleteVisitanteRepository quando visitante nao existe", async () => {
    findVisitanteByIdMock.mockResolvedValueOnce(null)

    await expect(deleteVisitanteService("id-inexistente")).rejects.toMatchObject({
      statusCode: 404,
      code: "VISITANTE_NOT_FOUND"
    })
    expect(deleteVisitanteMock).toHaveBeenCalledTimes(0)
  })
})
