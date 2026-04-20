import { checkRateLimit } from "@/lib/rate-limiter"
import { requestPasswordResetSchema } from "@/modules/auth/schemas/request-password-reset.schema"
import { requestPasswordResetService } from "@/modules/auth/services/request-password-reset.service"
import { toErrorResponse } from "@/shared/errors/app-error"

export async function POST(request: Request) {
  try {
    const ip =
      request.headers.get("x-forwarded-for") ??
      request.headers.get("x-real-ip") ??
      "unknown"
    const rateLimit = checkRateLimit(`password-reset:${ip}`)

    if (!rateLimit.allowed) {
      return Response.json(
        {
          success: false,
          error: {
            code: "RATE_LIMIT",
            message: "Muitas tentativas. Tente novamente mais tarde."
          }
        },
        {
          status: 429,
          headers: { "Retry-After": String(rateLimit.retryAfter) }
        }
      )
    }

    const body = await request.json()
    const parsed = requestPasswordResetSchema.safeParse(body)

    if (!parsed.success) {
      return Response.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Email inválido",
            details: parsed.error.flatten().fieldErrors
          }
        },
        { status: 400 }
      )
    }

    await requestPasswordResetService(parsed.data)

    return Response.json(
      { success: true, message: "Se o email existir, você receberá um link de recuperação." },
      { status: 200 }
    )
  } catch (error) {
    return toErrorResponse(error)
  }
}
