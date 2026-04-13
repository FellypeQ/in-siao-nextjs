import { AuthenticatedShell } from "@/frontend/components/layout/authenticated-shell"
import { VisitanteForm } from "@/frontend/features/visitantes/components/visitante-form"
import { requireAuthSession } from "@/lib/require-auth-session"

type EditarVisitantePageProps = {
  params: Promise<{ id: string }>
}

export default async function EditarVisitantePage({ params }: EditarVisitantePageProps) {
  const session = await requireAuthSession()
  const { id } = await params

  return (
    <AuthenticatedShell user={{ nome: session.nome, email: session.email }}>
      <VisitanteForm mode="edit" visitanteId={id} />
    </AuthenticatedShell>
  )
}
