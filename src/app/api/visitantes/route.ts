import { requireAuthSessionForApi } from "@/lib/require-auth-session"
import { createVisitanteSchema } from "@/modules/visitantes/schemas/create-visitante.schema"
import { listVisitantesSchema } from "@/modules/visitantes/schemas/list-visitantes.schema"
import { createVisitanteService } from "@/modules/visitantes/services/create-visitante.service"
import { listVisitantesService } from "@/modules/visitantes/services/list-visitantes.service"
import { Permission } from "@/shared/constants/permissions"
import { AppError, toErrorResponse } from "@/shared/errors/app-error"
import { hasPermission } from "@/shared/utils/require-permission"

export async function POST(request: Request) {
  try {
    const session = await requireAuthSessionForApi()

    if (!hasPermission(session, Permission.VISITANTES_CADASTRAR)) {
      throw new AppError("Sem permissao para cadastrar visitantes", 403, "FORBIDDEN")
    }

    const body = await request.json()
    const parsed = createVisitanteSchema.safeParse(body)

    if (!parsed.success) {
      return Response.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Dados invalidos",
            details: parsed.error.flatten().fieldErrors
          }
        },
        { status: 400 }
      )
    }

    const visitante = await createVisitanteService(parsed.data)

    return Response.json({ success: true, visitante }, { status: 201 })
  } catch (error) {
    return toErrorResponse(error)
  }
}

export async function GET(request: Request) {
  try {
    const session = await requireAuthSessionForApi()

    if (!hasPermission(session, Permission.VISITANTES_LISTAR)) {
      throw new AppError("Sem permissao para listar visitantes", 403, "FORBIDDEN")
    }

    const url = new URL(request.url)
    const parsed = listVisitantesSchema.safeParse({
      page: url.searchParams.get("page") ?? 1,
      limit: url.searchParams.get("limit") ?? 20,
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

    const result = await listVisitantesService(parsed.data)

    return Response.json({ success: true, ...result })
  } catch (error) {
    return toErrorResponse(error)
  }
}
