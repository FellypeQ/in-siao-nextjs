import { AuthenticatedShell } from "@/frontend/components/layout/authenticated-shell";
import { InnerPageContent } from "@/frontend/components/layout/inner-page-content";
import { VisitantesHomeView } from "@/frontend/features/visitantes/components/visitantes-home-view";
import { requireAuthSession } from "@/lib/require-auth-session";
import { PERMISSIONS_BY_MODULE } from "@/shared/constants/permissions";
import { hasPermission } from "@/shared/utils/require-permission";
import { redirect } from "next/navigation";

export default async function VisitantesPage() {
  const session = await requireAuthSession();

  const hasAnyVisitantePermission =
    session.role === "ADMIN" ||
    PERMISSIONS_BY_MODULE.Visitantes.some((p) => hasPermission(session, p));

  if (!hasAnyVisitantePermission) {
    redirect("/");
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
      <InnerPageContent>
        <VisitantesHomeView
          permissions={session.permissions}
          role={session.role}
        />
      </InnerPageContent>
    </AuthenticatedShell>
  );
}
