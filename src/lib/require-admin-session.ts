import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { SESSION_COOKIE_NAME, verifySessionToken } from "@/lib/auth";
import { AppError } from "@/shared/errors/app-error";

export async function requireAdminSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (!token) {
    redirect("/login");
  }

  const session = await verifySessionToken(token);

  if (!session) {
    redirect("/login");
  }

  if (session.role !== "ADMIN") {
    redirect("/");
  }

  return session;
}

export async function requireAdminSessionForApi() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (!token) {
    throw new AppError("Nao autenticado", 401, "UNAUTHORIZED");
  }

  const session = await verifySessionToken(token);

  if (!session) {
    throw new AppError("Sessao invalida", 401, "INVALID_SESSION");
  }

  if (session.role !== "ADMIN") {
    throw new AppError("Acesso negado", 403, "FORBIDDEN");
  }

  return session;
}
