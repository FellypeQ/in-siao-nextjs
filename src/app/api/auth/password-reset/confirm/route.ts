import { confirmPasswordResetSchema } from "@/modules/auth/schemas/confirm-password-reset.schema"
import { confirmPasswordResetService } from "@/modules/auth/services/confirm-password-reset.service"
import { toErrorResponse } from "@/shared/errors/app-error"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const parsed = confirmPasswordResetSchema.safeParse(body)

    if (!parsed.success) {
      return Response.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Dados inválidos",
            details: parsed.error.flatten().fieldErrors
          }
        },
        { status: 400 }
      )
    }

    await confirmPasswordResetService(parsed.data.token, parsed.data.password)

    return Response.json({ success: true }, { status: 200 })
  } catch (error) {
    return toErrorResponse(error)
  }
}
