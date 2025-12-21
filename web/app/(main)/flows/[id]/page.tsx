import { FlowDetailPage } from "@/features/flows/components/flow-detail-page";

type Props = { params: { id: string } };

export default function Page({ params }: Props) {
  return <FlowDetailPage flowId={params.id} />;
}
