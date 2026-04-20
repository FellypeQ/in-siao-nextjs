import { prisma } from "@/lib/prisma"

export type ChartDataPoint = {
  date: string
  count: number
}

const OFFSET_MS = 3 * 60 * 60 * 1000 // UTC-3

export async function getVisitantesChartDataRepository(startDate: Date): Promise<ChartDataPoint[]> {
  const members = await prisma.member.findMany({
    where: { createdAt: { gte: startDate } },
    select: { createdAt: true },
  })

  const countsByDay = new Map<string, number>()

  for (const member of members) {
    const localDate = new Date(member.createdAt.getTime() - OFFSET_MS)
    const dateStr = localDate.toISOString().slice(0, 10)
    countsByDay.set(dateStr, (countsByDay.get(dateStr) ?? 0) + 1)
  }

  return Array.from(countsByDay.entries())
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => a.date.localeCompare(b.date))
}
