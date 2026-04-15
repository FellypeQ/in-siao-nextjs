import { AuthenticatedShell } from "@/frontend/components/layout/authenticated-shell";
import { UsuarioForm } from "@/frontend/features/usuarios/components/usuario-form";
import { requireAdminSession } from "@/lib/require-admin-session";

type EditarUsuarioPageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditarUsuarioPage({
  params,
}: EditarUsuarioPageProps) {
  const session = await requireAdminSession();
  const { id } = await params;

  return (
    <AuthenticatedShell
      user={{ nome: session.nome, email: session.email, role: session.role }}
    >
      <UsuarioForm usuarioId={id} currentUserId={session.sub} />
    </AuthenticatedShell>
  );
}
