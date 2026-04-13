import { AuthenticatedShell } from "@/components/layout/authenticated-shell"
import { requireAuthSession } from "@/lib/require-auth-session"
import { VisitantesList } from "@/modules/visitantes/components/visitantes-list"

export default async function VisitantesPage() {
  const session = await requireAuthSession()

  return (
    <AuthenticatedShell user={{ nome: session.nome, email: session.email }}>
      <VisitantesList />
    </AuthenticatedShell>
  )
}
