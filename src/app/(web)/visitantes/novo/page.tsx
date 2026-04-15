import { AuthenticatedShell } from "@/frontend/components/layout/authenticated-shell";
import { VisitanteForm } from "@/frontend/features/visitantes/components/visitante-form";
import { requireAuthSession } from "@/lib/require-auth-session";
import { Permission } from "@/shared/constants/permissions";
import { hasPermission } from "@/shared/utils/require-permission";
import { redirect } from "next/navigation";

export default async function NovoVisitantePage() {
  const session = await requireAuthSession();

  if (!hasPermission(session, Permission.VISITANTES_CADASTRAR)) {
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
      <VisitanteForm mode="create" />
    </AuthenticatedShell>
  );
}
