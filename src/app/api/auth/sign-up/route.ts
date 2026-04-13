import { signUpSchema } from "@/modules/auth/schemas/sign-up.schema"
import { signUpAuthService } from "@/modules/auth/services/sign-up-auth.service"
import { toErrorResponse } from "@/shared/errors/app-error"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const parsed = signUpSchema.safeParse(body)

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

    const user = await signUpAuthService(parsed.data)

    return Response.json({ success: true, user }, { status: 201 })
  } catch (error) {
    return toErrorResponse(error)
  }
}
