
import { useMemo, useState, useEffect } from "react";
import { FlowDTO } from "@/types/dto";
import { ownerForFlow } from "../lib/flow-utils";

export function useFlowsFilters(flows: FlowDTO[]) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<"all" | FlowDTO["status"]>("all");
  const [owner, setOwner] = useState<string>("all");

  const ownerOptions = useMemo(() => {
    const unique = new Set<string>();
    for (const flow of flows) unique.add(ownerForFlow(flow));
    return ["all", ...Array.from(unique).sort((a, b) => a.localeCompare(b))];
  }, [flows]);

  // Reset owner if it's no longer valid
  useEffect(() => {
    if (owner === "all") return;
    if (ownerOptions.includes(owner)) return;
    setOwner("all");
  }, [owner, ownerOptions]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return flows
      .filter((flow) => (status === "all" ? true : flow.status === status))
      .filter((flow) => (owner === "all" ? true : ownerForFlow(flow) === owner))
      // Filter by name (case-insensitive)
      .filter((flow) => (!q ? true : flow.name.toLowerCase().includes(q) || flow.id.toLowerCase().includes(q)))
      // Default sort by updatedAt desc
      .sort((a, b) => (b.updatedAt || "").localeCompare(a.updatedAt || ""));
  }, [flows, owner, query, status]);

  return {
    query,
    setQuery,
    status,
    setStatus,
    owner,
    setOwner,
    ownerOptions,
    filtered,
  };
}
