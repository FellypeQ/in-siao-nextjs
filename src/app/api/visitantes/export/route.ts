import { cookies } from "next/headers"

import { SESSION_COOKIE_NAME, verifySessionToken } from "@/lib/auth"
import { exportVisitantesSchema } from "@/modules/visitantes/schemas/export-visitantes.schema"
import { exportVisitantesExcelService } from "@/modules/visitantes/services/export-visitantes-excel.service"
import { toErrorResponse } from "@/shared/errors/app-error"

export async function GET(request: Request) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get(SESSION_COOKIE_NAME)?.value

    if (!token) {
      return Response.json(
        {
          success: false,
          error: {
            code: "UNAUTHORIZED",
            message: "Sessao invalida"
          }
        },
        { status: 401 }
      )
    }

    const session = await verifySessionToken(token)

    if (!session) {
      return Response.json(
        {
          success: false,
          error: {
            code: "UNAUTHORIZED",
            message: "Sessao invalida"
          }
        },
        { status: 401 }
      )
    }

    const url = new URL(request.url)
    const parsed = exportVisitantesSchema.safeParse({
      createdFrom: url.searchParams.get("createdFrom") ?? undefined,
      createdTo: url.searchParams.get("createdTo") ?? undefined
    })

    if (!parsed.success) {
      return Response.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Parametros invalidos",
            details: parsed.error.flatten().fieldErrors
          }
        },
        { status: 400 }
      )
    }

    const result = await exportVisitantesExcelService(parsed.data)

    return new Response(result.file, {
      status: 200,
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename=\"${result.fileName}\"`,
        "Cache-Control": "no-store",
        "X-Export-Total": String(result.totalVisitantes)
      }
    })
  } catch (error) {
    return toErrorResponse(error)
  }
}
