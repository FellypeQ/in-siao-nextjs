import { AuthenticatedShell } from "@/components/layout/authenticated-shell"
import { requireAuthSession } from "@/lib/require-auth-session"
import { VisitanteForm } from "@/modules/visitantes/components/visitante-form"

export default async function NovoVisitantePage() {
  const session = await requireAuthSession()

  return (
    <AuthenticatedShell user={{ nome: session.nome, email: session.email }}>
      <VisitanteForm mode="create" />
    </AuthenticatedShell>
  )
}
