import { AuthenticatedShell } from "@/frontend/components/layout/authenticated-shell";
import { InnerPageContent } from "@/frontend/components/layout/inner-page-content";
import { VisitanteForm } from "@/frontend/features/visitantes/components/visitante-form";
import { requireAuthSession } from "@/lib/require-auth-session";
import { Permission } from "@/shared/constants/permissions";
import { hasPermission } from "@/shared/utils/require-permission";
import { redirect } from "next/navigation";

type EditarVisitantePageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditarVisitantePage({
  params,
}: EditarVisitantePageProps) {
  const session = await requireAuthSession();

  if (!hasPermission(session, Permission.VISITANTES_EDITAR)) {
    redirect("/visitantes");
  }

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
      <InnerPageContent header={{ title: "Editar Visitante" }}>
        <VisitanteForm
          mode="edit"
          visitanteId={id}
          permissions={session.permissions}
          role={session.role}
        />
      </InnerPageContent>
    </AuthenticatedShell>
  );
}
