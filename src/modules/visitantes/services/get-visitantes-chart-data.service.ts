import { getVisitantesChartDataRepository } from "@/modules/visitantes/repositories/get-visitantes-chart-data.repository"

const OFFSET_MS = 3 * 60 * 60 * 1000 // UTC-3
const DAYS = 60

export async function getVisitantesChartDataService() {
  const nowUtc = new Date()

  // "Hoje" no fuso UTC-3
  const localNowMs = nowUtc.getTime() - OFFSET_MS
  const todayLocalStr = new Date(localNowMs).toISOString().slice(0, 10)

  // Meia-noite de hoje (UTC-3) representada em UTC
  const todayLocalMidnightMs = new Date(todayLocalStr + "T00:00:00Z").getTime()

  // Meia-noite de 60 dias atrás (UTC-3) em UTC
  const startLocalMidnightMs = todayLocalMidnightMs - DAYS * 24 * 60 * 60 * 1000
  const startDateUtc = new Date(startLocalMidnightMs + OFFSET_MS)

  return getVisitantesChartDataRepository(startDateUtc)
}
