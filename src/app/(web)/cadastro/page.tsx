import { RegisterViaInvitePageView } from "@/frontend/features/auth/components/register-via-invite-page-view";

type CadastroPageProps = {
  searchParams: Promise<{ token?: string }>;
};

export default async function CadastroPage({ searchParams }: CadastroPageProps) {
  const { token } = await searchParams;

  return <RegisterViaInvitePageView token={token ?? null} />;
}
