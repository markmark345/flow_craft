import { FlowDetailPage } from "@/features/flows/components/flow-detail-page";

type Props = { params: Promise<{ id: string }> };

export default async function Page({ params }: Props) {
  const { id } = await params;
  return <FlowDetailPage flowId={id} />;
}
