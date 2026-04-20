import { requireAuthSessionForApi } from "@/lib/require-auth-session"
import { getVisitantesChartDataService } from "@/modules/visitantes/services/get-visitantes-chart-data.service"
import { toErrorResponse } from "@/shared/errors/app-error"

export async function GET() {
  try {
    await requireAuthSessionForApi()
    const data = await getVisitantesChartDataService()
    return Response.json(data)
  } catch (error) {
    return toErrorResponse(error)
  }
}
