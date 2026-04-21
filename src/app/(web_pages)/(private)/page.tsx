import { AuthenticatedShell } from "@/frontend/components/layout/authenticated-shell";
import { InnerPageContent } from "@/frontend/components/layout/inner-page-content";
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
      <InnerPageContent
        header={{ title: "Gestão Sião", withoutBackButton: true }}
      >
        <HomePageView />
      </InnerPageContent>
    </AuthenticatedShell>
  );
}
