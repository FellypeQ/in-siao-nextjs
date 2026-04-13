import { beforeEach, describe, expect, it, vi } from "vitest"

import { listVisitantesService } from "@/modules/visitantes/services/list-visitantes.service"

const listVisitantesRepositoryMock = vi.fn()

vi.mock("@/modules/visitantes/repositories/list-visitantes.repository", () => ({
  listVisitantesRepository: (input: { page: number; limit: number }) => listVisitantesRepositoryMock(input)
}))

describe("listVisitantesService", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("delegates params para repository", async () => {
    listVisitantesRepositoryMock.mockResolvedValueOnce({
      items: [],
      total: 0,
      page: 1,
      limit: 20,
      totalPages: 0
    })

    const result = await listVisitantesService({ page: 1, limit: 20 })

    expect(listVisitantesRepositoryMock).toHaveBeenCalledWith({ page: 1, limit: 20 })
    expect(result.total).toBe(0)
  })
})
