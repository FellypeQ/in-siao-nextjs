import { AuthenticatedShell } from "@/frontend/components/layout/authenticated-shell";
import { InnerPageContent } from "@/frontend/components/layout/inner-page-content";
import { PerfilFormView } from "@/frontend/features/perfis/components/perfil-form-view";
import { requireMasterSession } from "@/lib/require-master-session";

type EditarPerfilPageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditarPerfilPage({ params }: EditarPerfilPageProps) {
  const session = await requireMasterSession();
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
      <InnerPageContent header={{ title: "Editar Perfil" }}>
        <PerfilFormView perfilId={id} />
      </InnerPageContent>
    </AuthenticatedShell>
  );
}
