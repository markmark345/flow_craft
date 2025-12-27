import { CredentialsPage } from "@/features/credentials/components/credentials-page";

type Props = { params: { id: string } };

export default function Page({ params }: Props) {
  return <CredentialsPage scope="project" projectId={params.id} />;
}
