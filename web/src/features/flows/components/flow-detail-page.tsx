"use client";

import { PageHeading } from "@/components/ui/page-heading";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { useFlowDetailQuery } from "../hooks/use-flow-detail";

type Props = { flowId: string };

export function FlowDetailPage({ flowId }: Props) {
  const { flow, loading, error } = useFlowDetailQuery(flowId);

  if (loading && !flow) {
    return <p className="text-muted">Loading flow...</p>;
  }

  if (!flow) {
    return (
      <div className="space-y-3">
        <PageHeading title="Flow not found" />
        <p className="text-muted text-sm">
          {error ? error : `No flow found for id ${flowId}`}
        </p>
      </div>
    );
  }
  return (
    <div className="space-y-4">
      <PageHeading title={flow.name} description="Flow detail" actions={<Badge label={flow.status} />} />
      <div className="bg-surface border border-border rounded-md p-4 space-y-3">
        <div className="text-sm text-muted">Version {flow.version}</div>
        <Link href={`/flows/${flow.id}/builder`}>
          <Button>Open in Builder</Button>
        </Link>
      </div>
    </div>
  );
}
