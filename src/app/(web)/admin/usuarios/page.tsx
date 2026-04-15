import { AuthenticatedShell } from "@/frontend/components/layout/authenticated-shell";
import { UsuariosTable } from "@/frontend/features/usuarios/components/usuarios-table";
import { requireAdminSession } from "@/lib/require-admin-session";

export default async function UsuariosPage() {
  const session = await requireAdminSession();

  return (
    <AuthenticatedShell
      user={{ nome: session.nome, email: session.email, role: session.role }}
    >
      <UsuariosTable currentUserId={session.sub} />
    </AuthenticatedShell>
  );
}
