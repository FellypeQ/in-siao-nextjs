import { AuthenticatedShell } from "@/frontend/components/layout/authenticated-shell";
import { InnerPageContent } from "@/frontend/components/layout/inner-page-content";
import { PerfilFormView } from "@/frontend/features/perfis/components/perfil-form-view";
import { requireMasterSession } from "@/lib/require-master-session";

export default async function NovoPerfisPage() {
  const session = await requireMasterSession();

  return (
    <AuthenticatedShell
      user={{
        nome: session.nome,
        email: session.email,
        role: session.role,
        permissions: session.permissions,
      }}
    >
      <InnerPageContent header={{ title: "Novo Perfil" }}>
        <PerfilFormView />
      </InnerPageContent>
    </AuthenticatedShell>
  );
}
