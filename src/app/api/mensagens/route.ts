import { requireAuthSessionForApi } from "@/lib/require-auth-session"
import { listMessageTemplatesService } from "@/modules/mensagens/services/list-message-templates.service"
import { createMessageTemplateService } from "@/modules/mensagens/services/create-message-template.service"
import { createMessageTemplateSchema } from "@/modules/mensagens/schemas/message-template.schema"
import { Permission } from "@/shared/constants/permissions"
import { AppError, toErrorResponse } from "@/shared/errors/app-error"
import { hasPermission } from "@/shared/utils/require-permission"

export async function GET() {
  try {
    const session = await requireAuthSessionForApi()

    if (!hasPermission(session, Permission.MENSAGENS_GERENCIAR)) {
      throw new AppError("Sem permissao para gerenciar mensagens", 403, "FORBIDDEN")
    }

    const templates = await listMessageTemplatesService()
    return Response.json(templates)
  } catch (error) {
    return toErrorResponse(error)
  }
}

export async function POST(req: Request) {
  try {
    const session = await requireAuthSessionForApi()

    if (!hasPermission(session, Permission.MENSAGENS_GERENCIAR)) {
      throw new AppError("Sem permissao para gerenciar mensagens", 403, "FORBIDDEN")
    }

    const body = await req.json()
    const parsed = createMessageTemplateSchema.safeParse(body)

    if (!parsed.success) {
      return Response.json(
        { success: false, error: { code: "VALIDATION_ERROR", message: "Dados invalidos", details: parsed.error.flatten().fieldErrors } },
        { status: 400 }
      )
    }

    const template = await createMessageTemplateService(parsed.data)
    return Response.json(template, { status: 201 })
  } catch (error) {
    return toErrorResponse(error)
  }
}
