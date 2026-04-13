import { cookies } from "next/headers"
import { redirect } from "next/navigation"

import { SESSION_COOKIE_NAME, verifySessionToken } from "@/lib/auth"

export async function requireAuthSession() {
  const cookieStore = await cookies()
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value

  if (!token) {
    redirect("/login")
  }

  const session = await verifySessionToken(token)

  if (!session) {
    redirect("/login")
  }

  return session
}
