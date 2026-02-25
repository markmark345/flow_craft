import { CredentialsPage } from "@/features/credentials/components/credentials-page";

type Props = { params: Promise<{ id: string }> };

export default async function Page({ params }: Props) {
  const { id } = await params;
  return <CredentialsPage scope="project" projectId={id} />;
}
