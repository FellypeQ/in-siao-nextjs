import { AuthenticatedShell } from "@/frontend/components/layout/authenticated-shell";
import { requireAuthSession } from "@/lib/require-auth-session";
import { VisitantesList } from "@/frontend/features/visitantes/components/visitantes-list";
import { Permission } from "@/shared/constants/permissions";
import { hasPermission } from "@/shared/utils/require-permission";
import { Alert } from "@mui/material";

export default async function VisitantesPage() {
  const session = await requireAuthSession();
  const canListVisitantes = hasPermission(session, Permission.VISITANTES_LISTAR);

  return (
    <AuthenticatedShell
      user={{
        nome: session.nome,
        email: session.email,
        role: session.role,
        permissions: session.permissions,
      }}
    >
      {canListVisitantes ? (
        <VisitantesList
          role={session.role}
          permissions={session.permissions}
        />
      ) : (
        <Alert severity="error">
          Voce nao tem permissao para visualizar a listagem de visitantes.
        </Alert>
      )}
    </AuthenticatedShell>
  );
}
