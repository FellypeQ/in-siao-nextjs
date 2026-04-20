import { AuthenticatedShell } from "@/frontend/components/layout/authenticated-shell";
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
      <PerfilView />
    </AuthenticatedShell>
  );
}