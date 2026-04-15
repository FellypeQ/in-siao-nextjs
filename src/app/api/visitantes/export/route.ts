import { requireAuthSessionForApi } from "@/lib/require-auth-session"
import { exportVisitantesSchema } from "@/modules/visitantes/schemas/export-visitantes.schema"
import { exportVisitantesExcelService } from "@/modules/visitantes/services/export-visitantes-excel.service"
import { Permission } from "@/shared/constants/permissions"
import { AppError, toErrorResponse } from "@/shared/errors/app-error"
import { hasPermission } from "@/shared/utils/require-permission"

export async function GET(request: Request) {
  try {
    const session = await requireAuthSessionForApi()

    if (!hasPermission(session, Permission.VISITANTES_EXPORTAR)) {
      throw new AppError("Sem permissao para exportar visitantes", 403, "FORBIDDEN")
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
