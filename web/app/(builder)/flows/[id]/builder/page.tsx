import { BuilderPage } from "@/features/builder/components/builder-page";

type Props = { params: Promise<{ id: string }> };

export default async function Page({ params }: Props) {
  const { id } = await params;
  return <BuilderPage flowId={id} />;
}
