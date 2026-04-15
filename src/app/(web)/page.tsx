import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { AuthenticatedShell } from "@/frontend/components/layout/authenticated-shell";
import { HomePageView } from "@/frontend/features/home/components/home-page-view";
import { SESSION_COOKIE_NAME, verifySessionToken } from "@/lib/auth";

export default async function HomePage() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (!token) {
    redirect("/login");
  }

  const session = await verifySessionToken(token);

  if (!session) {
    redirect("/login");
  }

  return (
    <AuthenticatedShell
      user={{ nome: session.nome, email: session.email, role: session.role }}
    >
      <HomePageView />
    </AuthenticatedShell>
  );
}
