import { NextResponse } from "next/server"

import { setAuthCookie } from "@/lib/auth"
import { signInSchema } from "@/modules/auth/schemas/sign-in.schema"
import { signInAuthService } from "@/modules/auth/services/sign-in-auth.service"
import { toErrorResponse } from "@/shared/errors/app-error"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const parsed = signInSchema.safeParse(body)

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

    const result = await signInAuthService(parsed.data)
    const response = NextResponse.json({ success: true, user: result.user })

    setAuthCookie(response, result.token)

    return response
  } catch (error) {
    return toErrorResponse(error)
  }
}
