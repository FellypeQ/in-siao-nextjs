import { AuthenticatedShell } from "@/frontend/components/layout/authenticated-shell";
import { InnerPageContent } from "@/frontend/components/layout/inner-page-content";
import { MensagensPageView } from "@/frontend/features/mensagens/components/mensagens-page-view";
import { requireAuthSession } from "@/lib/require-auth-session";
import { Permission } from "@/shared/constants/permissions";
import { hasPermission } from "@/shared/utils/require-permission";
import { redirect } from "next/navigation";

export default async function MensagensPage() {
  const session = await requireAuthSession();

  if (
    session.role !== "ADMIN" &&
    !hasPermission(session, Permission.MENSAGENS_GERENCIAR)
  ) {
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
      <InnerPageContent
        header={{ title: "Gerenciar mensagens para visitantes" }}
      >
        <MensagensPageView />
      </InnerPageContent>
    </AuthenticatedShell>
  );
}
