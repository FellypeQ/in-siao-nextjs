import { getVisitanteDetailService } from "@/modules/visitantes/services/get-visitante-detail.service"
import { updateVisitanteSchema } from "@/modules/visitantes/schemas/update-visitante.schema"
import { updateVisitanteService } from "@/modules/visitantes/services/update-visitante.service"
import { toErrorResponse } from "@/shared/errors/app-error"

type Params = {
  params: Promise<{ id: string }>
}

export async function GET(_: Request, { params }: Params) {
  try {
    const { id } = await params
    const visitante = await getVisitanteDetailService(id)

    return Response.json({ success: true, visitante })
  } catch (error) {
    return toErrorResponse(error)
  }
}

export async function PUT(request: Request, { params }: Params) {
  try {
    const { id } = await params
    const body = await request.json()
    const parsed = updateVisitanteSchema.safeParse({ ...body, id })

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

    const updated = await updateVisitanteService(parsed.data)
    return Response.json({ success: true, visitante: updated })
  } catch (error) {
    return toErrorResponse(error)
  }
}
