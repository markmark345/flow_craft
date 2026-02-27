import { VariablesPage } from "@/features/variables/components/variables-page";

type Props = { params: Promise<{ id: string }> };

export default async function Page({ params }: Props) {
  const { id } = await params;
  return <VariablesPage scope="project" projectId={id} />;
}
