import { RunDetailPage } from "@/features/runs/components/run-detail-page";

type Props = { params: Promise<{ id: string }> };

export default async function Page({ params }: Props) {
  const { id } = await params;
  return <RunDetailPage runId={id} />;
}
