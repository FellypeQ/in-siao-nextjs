import { AuthenticatedShell } from "@/frontend/components/layout/authenticated-shell";
import { InnerPageContent } from "@/frontend/components/layout/inner-page-content";
import { VisitantesList } from "@/frontend/features/visitantes/components/visitantes-list";
import { requireAuthSession } from "@/lib/require-auth-session";
import { Permission } from "@/shared/constants/permissions";
import { hasPermission } from "@/shared/utils/require-permission";
import { redirect } from "next/navigation";

export default async function VisitantesListagemPage() {
  const session = await requireAuthSession();

  if (!hasPermission(session, Permission.VISITANTES_LISTAR)) {
    redirect("/visitantes");
  }

  return (
    <AuthenticatedShell
      user={{
        nome: session.nome,
        email: session.email,
        role: session.role,
        permissions: session.permissions,
      }}
    >
      <InnerPageContent header={{ title: "Listagem de Visitantes" }}>
        <VisitantesList role={session.role} permissions={session.permissions} />
      </InnerPageContent>
    </AuthenticatedShell>
  );
}
