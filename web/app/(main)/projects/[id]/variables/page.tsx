import { VariablesPage } from "@/features/variables/components/variables-page";

type Props = { params: { id: string } };

export default function Page({ params }: Props) {
  return <VariablesPage scope="project" projectId={params.id} />;
}
