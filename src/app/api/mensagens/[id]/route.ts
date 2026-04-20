import { requireAuthSessionForApi } from "@/lib/require-auth-session"
import { updateMessageTemplateService } from "@/modules/mensagens/services/update-message-template.service"
import { deleteMessageTemplateService } from "@/modules/mensagens/services/delete-message-template.service"
import { updateMessageTemplateSchema } from "@/modules/mensagens/schemas/message-template.schema"
import { Permission } from "@/shared/constants/permissions"
import { AppError, toErrorResponse } from "@/shared/errors/app-error"
import { hasPermission } from "@/shared/utils/require-permission"

type Params = {
  params: Promise<{ id: string }>
}

export async function PUT(req: Request, { params }: Params) {
  try {
    const session = await requireAuthSessionForApi()

    if (!hasPermission(session, Permission.MENSAGENS_GERENCIAR)) {
      throw new AppError("Sem permissao para gerenciar mensagens", 403, "FORBIDDEN")
    }

    const { id } = await params
    const body = await req.json()
    const parsed = updateMessageTemplateSchema.safeParse(body)

    if (!parsed.success) {
      return Response.json(
        { success: false, error: { code: "VALIDATION_ERROR", message: "Dados invalidos", details: parsed.error.flatten().fieldErrors } },
        { status: 400 }
      )
    }

    const template = await updateMessageTemplateService({ id, ...parsed.data })
    return Response.json(template)
  } catch (error) {
    return toErrorResponse(error)
  }
}

export async function DELETE(_: Request, { params }: Params) {
  try {
    const session = await requireAuthSessionForApi()

    if (!hasPermission(session, Permission.MENSAGENS_GERENCIAR)) {
      throw new AppError("Sem permissao para gerenciar mensagens", 403, "FORBIDDEN")
    }

    const { id } = await params
    const result = await deleteMessageTemplateService(id)

    return Response.json(result)
  } catch (error) {
    return toErrorResponse(error)
  }
}
