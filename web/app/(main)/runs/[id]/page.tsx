import { RunDetailPage } from "@/features/runs/components/run-detail-page";

type Props = { params: { id: string } };

export default function Page({ params }: Props) {
  return <RunDetailPage runId={params.id} />;
}
