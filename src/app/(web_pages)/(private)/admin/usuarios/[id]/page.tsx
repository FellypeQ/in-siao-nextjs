import { AuthenticatedShell } from "@/frontend/components/layout/authenticated-shell";
import { InnerPageContent } from "@/frontend/components/layout/inner-page-content";
import { UsuarioDetail } from "@/frontend/features/usuarios/components/usuario-detail";
import { requireAdminSession } from "@/lib/require-admin-session";

type UsuarioDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function UsuarioDetailPage({
  params,
}: UsuarioDetailPageProps) {
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
      <InnerPageContent header={{ title: "Detalhes do Usuário" }}>
        <UsuarioDetail usuarioId={id} />
      </InnerPageContent>
    </AuthenticatedShell>
  );
}
