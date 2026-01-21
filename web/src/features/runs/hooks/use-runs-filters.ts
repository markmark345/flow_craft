
import { useMemo, useState } from "react";
import { RunDTO, FlowDTO } from "@/types/dto";
import { cutoffFor, parseTime } from "../lib/run-utils";

export function useRunsFilters(runs: RunDTO[], flows: FlowDTO[]) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<"all" | RunDTO["status"]>("all");
  const [timeframe, setTimeframe] = useState<"24h" | "7d" | "30d" | "all">("24h");
  const [flowId, setFlowId] = useState<string>("all");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const cutoff = cutoffFor(timeframe);
    const flowsById = new Map(flows.map((f) => [f.id, f]));

    return runs
      .filter((r) => (status === "all" ? true : r.status === status))
      .filter((r) => (flowId === "all" ? true : r.flowId === flowId))
      .filter((r) => {
        if (!cutoff) return true;
        const t = parseTime(r.createdAt || r.startedAt);
        return t ? t >= cutoff : true;
      })
      .filter((r) => {
        if (!q) return true;
        const name = flowsById.get(r.flowId)?.name || "";
        return (
          r.id.toLowerCase().includes(q) ||
          r.flowId.toLowerCase().includes(q) ||
          name.toLowerCase().includes(q)
        );
      })
      .sort((a, b) => (b.createdAt || b.startedAt || "").localeCompare(a.createdAt || a.startedAt || ""));
  }, [flows, flowId, query, runs, status, timeframe]);

  return {
    query,
    setQuery,
    status,
    setStatus,
    timeframe,
    setTimeframe,
    flowId,
    setFlowId,
    filtered,
  };
}
