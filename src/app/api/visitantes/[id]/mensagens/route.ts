import { requireAuthSessionForApi } from "@/lib/require-auth-session"
import { getVisitanteMensagensService } from "@/modules/visitantes/services/get-visitante-mensagens.service"
import { logMensagemVisitanteService } from "@/modules/visitantes/services/log-mensagem-visitante.service"
import { logMensagemVisitanteSchema } from "@/modules/mensagens/schemas/message-template.schema"
import { Permission } from "@/shared/constants/permissions"
import { AppError, toErrorResponse } from "@/shared/errors/app-error"
import { hasPermission } from "@/shared/utils/require-permission"

type Params = {
  params: Promise<{ id: string }>
}

export async function GET(_: Request, { params }: Params) {
  try {
    const session = await requireAuthSessionForApi()

    const canAccess =
      hasPermission(session, Permission.MENSAGENS_ENVIAR) ||
      hasPermission(session, Permission.MENSAGENS_GERENCIAR)

    if (!canAccess) {
      throw new AppError("Sem permissao para acessar mensagens", 403, "FORBIDDEN")
    }

    const { id } = await params
    const data = await getVisitanteMensagensService(id)

    return Response.json(data)
  } catch (error) {
    return toErrorResponse(error)
  }
}

export async function POST(req: Request, { params }: Params) {
  try {
    const session = await requireAuthSessionForApi()

    if (!hasPermission(session, Permission.MENSAGENS_ENVIAR)) {
      throw new AppError("Sem permissao para enviar mensagens", 403, "FORBIDDEN")
    }

    const { id } = await params
    const body = await req.json()
    const parsed = logMensagemVisitanteSchema.safeParse(body)

    if (!parsed.success) {
      return Response.json(
        { success: false, error: { code: "VALIDATION_ERROR", message: "Dados invalidos", details: parsed.error.flatten().fieldErrors } },
        { status: 400 }
      )
    }

    const log = await logMensagemVisitanteService(id, parsed.data.messageTemplateId, session.sub)
    return Response.json(log, { status: 201 })
  } catch (error) {
    return toErrorResponse(error)
  }
}
