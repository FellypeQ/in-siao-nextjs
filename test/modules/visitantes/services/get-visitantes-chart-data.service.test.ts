import { beforeEach, describe, expect, it, vi } from "vitest"

import { getVisitantesChartDataService } from "@/modules/visitantes/services/get-visitantes-chart-data.service"

const repositoryMock = vi.fn()

vi.mock("@/modules/visitantes/repositories/get-visitantes-chart-data.repository", () => ({
  getVisitantesChartDataRepository: (startDate: unknown) => repositoryMock(startDate),
}))

describe("getVisitantesChartDataService", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("chama o repository com startDate aproximadamente 60 dias atrás", async () => {
    repositoryMock.mockResolvedValueOnce([])

    await getVisitantesChartDataService()

    expect(repositoryMock).toHaveBeenCalledOnce()

    const [startDate] = repositoryMock.mock.calls[0] as [Date]
    expect(startDate).toBeInstanceOf(Date)

    const diffDays = (Date.now() - startDate.getTime()) / (1000 * 60 * 60 * 24)
    expect(diffDays).toBeGreaterThanOrEqual(59)
    expect(diffDays).toBeLessThanOrEqual(61)
  })

  it("retorna os dados do repository", async () => {
    const mockData = [
      { date: "2026-03-01", count: 3 },
      { date: "2026-03-02", count: 1 },
    ]
    repositoryMock.mockResolvedValueOnce(mockData)

    const result = await getVisitantesChartDataService()

    expect(result).toEqual(mockData)
  })

  it("retorna array vazio quando não há cadastros no período", async () => {
    repositoryMock.mockResolvedValueOnce([])

    const result = await getVisitantesChartDataService()

    expect(result).toEqual([])
  })
})
