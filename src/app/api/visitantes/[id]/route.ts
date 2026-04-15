import { requireAuthSessionForApi } from "@/lib/require-auth-session"
import { getVisitanteDetailService } from "@/modules/visitantes/services/get-visitante-detail.service"
import { deleteVisitanteService } from "@/modules/visitantes/services/delete-visitante.service"
import { updateVisitanteSchema } from "@/modules/visitantes/schemas/update-visitante.schema"
import { updateVisitanteService } from "@/modules/visitantes/services/update-visitante.service"
import { Permission } from "@/shared/constants/permissions"
import { AppError, toErrorResponse } from "@/shared/errors/app-error"
import { hasPermission } from "@/shared/utils/require-permission"

type Params = {
  params: Promise<{ id: string }>
}

export async function GET(_: Request, { params }: Params) {
  try {
    const session = await requireAuthSessionForApi()

    if (!hasPermission(session, Permission.VISITANTES_LISTAR)) {
      throw new AppError("Sem permissao para listar visitantes", 403, "FORBIDDEN")
    }

    const { id } = await params
    const visitante = await getVisitanteDetailService(id)

    return Response.json({ success: true, visitante })
  } catch (error) {
    return toErrorResponse(error)
  }
}

async function updateVisitante(request: Request, { params }: Params) {
  try {
    const session = await requireAuthSessionForApi()

    if (!hasPermission(session, Permission.VISITANTES_EDITAR)) {
      throw new AppError("Sem permissao para editar visitantes", 403, "FORBIDDEN")
    }

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

export async function PUT(request: Request, context: Params) {
  return updateVisitante(request, context)
}

export async function PATCH(request: Request, context: Params) {
  return updateVisitante(request, context)
}

export async function DELETE(_: Request, { params }: Params) {
  try {
    const session = await requireAuthSessionForApi()

    if (!hasPermission(session, Permission.VISITANTES_EXCLUIR)) {
      throw new AppError("Sem permissao para excluir visitantes", 403, "FORBIDDEN")
    }

    const { id } = await params
    const result = await deleteVisitanteService(id)

    return Response.json(result)
  } catch (error) {
    return toErrorResponse(error)
  }
}
