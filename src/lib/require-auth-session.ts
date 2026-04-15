import { cookies } from "next/headers"
import { redirect } from "next/navigation"

import { SESSION_COOKIE_NAME, verifySessionToken } from "@/lib/auth"
import { findUserByIdRepository } from "@/modules/auth/repositories/find-user-by-id.repository"

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

  const currentUser = await findUserByIdRepository(session.sub)

  if (!currentUser || currentUser.deletedAt) {
    redirect("/login")
  }

  return {
    ...session,
    nome: currentUser.nome,
    email: currentUser.email,
    role: currentUser.role
  }
}
