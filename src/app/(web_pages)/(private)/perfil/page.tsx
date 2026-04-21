import { AuthenticatedShell } from "@/frontend/components/layout/authenticated-shell";
import { InnerPageContent } from "@/frontend/components/layout/inner-page-content";
import { PerfilView } from "@/frontend/features/perfil/components/perfil-view";
import { requireAuthSession } from "@/lib/require-auth-session";

export default async function PerfilPage() {
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
      <InnerPageContent header={{ title: "Meu Perfil" }}>
        <PerfilView />
      </InnerPageContent>
    </AuthenticatedShell>
  );
}
