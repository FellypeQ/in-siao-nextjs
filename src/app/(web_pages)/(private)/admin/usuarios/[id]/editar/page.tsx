import { AuthenticatedShell } from "@/frontend/components/layout/authenticated-shell";
import { InnerPageContent } from "@/frontend/components/layout/inner-page-content";
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
      user={{
        nome: session.nome,
        email: session.email,
        role: session.role,
        permissions: session.permissions,
      }}
    >
      <InnerPageContent header={{ title: "Editar Usuário" }}>
        <UsuarioForm usuarioId={id} currentUserId={session.sub} currentUserRole={session.role} />
      </InnerPageContent>
    </AuthenticatedShell>
  );
}
