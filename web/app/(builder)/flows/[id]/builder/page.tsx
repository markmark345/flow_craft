import { BuilderPage } from "@/features/builder/components/builder-page";

type Props = { params: { id: string } };

export default function Page({ params }: Props) {
  return <BuilderPage flowId={params.id} />;
}
