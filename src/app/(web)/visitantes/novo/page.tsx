import { AuthenticatedShell } from "@/frontend/components/layout/authenticated-shell";
import { VisitanteForm } from "@/frontend/features/visitantes/components/visitante-form";
import { requireAuthSession } from "@/lib/require-auth-session";

export default async function NovoVisitantePage() {
  const session = await requireAuthSession();

  return (
    <AuthenticatedShell
      user={{ nome: session.nome, email: session.email, role: session.role }}
    >
      <VisitanteForm mode="create" />
    </AuthenticatedShell>
  );
}
