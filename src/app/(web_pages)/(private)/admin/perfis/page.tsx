import { AuthenticatedShell } from "@/frontend/components/layout/authenticated-shell";
import { InnerPageContent } from "@/frontend/components/layout/inner-page-content";
import { PerfisListView } from "@/frontend/features/perfis/components/perfis-list-view";
import { requireMasterSession } from "@/lib/require-master-session";

export default async function PerfisPage() {
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
      <InnerPageContent header={{ title: "Perfis de Usuário", withoutBackButton: true }}>
        <PerfisListView />
      </InnerPageContent>
    </AuthenticatedShell>
  );
}
