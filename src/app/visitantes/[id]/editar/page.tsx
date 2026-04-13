import { AuthenticatedShell } from "@/components/layout/authenticated-shell"
import { requireAuthSession } from "@/lib/require-auth-session"
import { VisitanteForm } from "@/modules/visitantes/components/visitante-form"

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
