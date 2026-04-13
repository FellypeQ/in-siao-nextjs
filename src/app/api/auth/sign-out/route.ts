import { NextResponse } from "next/server"

import { clearAuthCookie } from "@/lib/auth"
import { signOutAuthService } from "@/modules/auth/services/sign-out-auth.service"
import { toErrorResponse } from "@/shared/errors/app-error"

export async function POST() {
  try {
    await signOutAuthService()

    const response = NextResponse.json({ success: true })
    clearAuthCookie(response)

    return response
  } catch (error) {
    return toErrorResponse(error)
  }
}
