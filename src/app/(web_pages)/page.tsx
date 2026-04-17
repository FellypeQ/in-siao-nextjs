import { AuthenticatedShell } from "@/frontend/components/layout/authenticated-shell";
import { HomePageView } from "@/frontend/features/home/components/home-page-view";
import { requireAuthSession } from "@/lib/require-auth-session";

export default async function HomePage() {
  const session = await requireAuthSession();

  return (
    <AuthenticatedShell
      user={{
        nome: session.nome,
        email: session.email,
        role: session.role,
        permissions: session.permissions,
      }}
    >
      <HomePageView />
    </AuthenticatedShell>
  );
}
