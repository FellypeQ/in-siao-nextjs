import { AuthenticatedShell } from "@/frontend/components/layout/authenticated-shell";
import { InnerPageContent } from "@/frontend/components/layout/inner-page-content";
import { UsuariosTable } from "@/frontend/features/usuarios/components/usuarios-table";
import { requireAdminSession } from "@/lib/require-admin-session";

export default async function UsuariosPage() {
  const session = await requireAdminSession();

  return (
    <AuthenticatedShell
      user={{
        nome: session.nome,
        email: session.email,
        role: session.role,
        permissions: session.permissions,
      }}
    >
      <InnerPageContent>
        <UsuariosTable currentUserId={session.sub} />
      </InnerPageContent>
    </AuthenticatedShell>
  );
}
