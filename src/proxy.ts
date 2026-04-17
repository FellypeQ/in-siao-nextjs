import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

import {
  clearAuthCookie,
  getTokenFromRequest,
  verifySessionToken
} from "@/lib/auth"

const PUBLIC_PATHS = [
  "/login",
  "/cadastro",
  "/api/auth/sign-in",
  "/api/auth/sign-up",
  "/api/auth/convite/validate"
]

function isPublicPath(pathname: string): boolean {
  return PUBLIC_PATHS.some((path) => pathname === path || pathname.startsWith(`${path}/`))
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const token = getTokenFromRequest(request)
  const session = token ? await verifySessionToken(token) : null

  if (pathname === "/login" && session) {
    return NextResponse.redirect(new URL("/", request.url))
  }

  if (isPublicPath(pathname)) {
    return NextResponse.next()
  }

  if (!session) {
    const response = NextResponse.redirect(new URL("/login", request.url))

    if (token) {
      clearAuthCookie(response)
    }

    return response
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|images/).*)" ]
}