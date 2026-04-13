import { createVisitanteSchema } from "@/modules/visitantes/schemas/create-visitante.schema"
import { listVisitantesSchema } from "@/modules/visitantes/schemas/list-visitantes.schema"
import { createVisitanteService } from "@/modules/visitantes/services/create-visitante.service"
import { listVisitantesService } from "@/modules/visitantes/services/list-visitantes.service"
import { toErrorResponse } from "@/shared/errors/app-error"

export async function POST(request: Request) {
  try {
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
    const url = new URL(request.url)
    const parsed = listVisitantesSchema.safeParse({
      page: url.searchParams.get("page") ?? 1,
      limit: url.searchParams.get("limit") ?? 20
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
