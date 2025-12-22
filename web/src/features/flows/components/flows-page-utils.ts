import { FlowDTO, RunDTO } from "@/shared/types/dto";

export type RunMeta = {
  when: string;
  icon: string;
  label: string;
  className: string;
};

export function ownerForFlow(flow: FlowDTO): string {
  if (flow.status === "archived") return "System";
  return flow.owner?.name || flow.owner?.email || "Unknown";
}

export function statusTone(status: FlowDTO["status"]) {
  if (status === "active") return "success";
  if (status === "archived") return "warning";
  return "default";
}

export function formatRelative(raw?: string): string {
  if (!raw) return "Never";
  const d = new Date(raw);
  if (!Number.isFinite(d.getTime())) return "Never";
  const diffMs = Date.now() - d.getTime();
  const sec = Math.round(diffMs / 1000);
  if (sec < 10) return "Just now";
  const min = Math.round(sec / 60);
  if (min < 60) return `${min} min${min === 1 ? "" : "s"} ago`;
  const hrs = Math.round(min / 60);
  if (hrs < 24) return `${hrs} hour${hrs === 1 ? "" : "s"} ago`;
  const days = Math.round(hrs / 24);
  return `${days} day${days === 1 ? "" : "s"} ago`;
}

export function formatUpdatedAt(raw?: string): string {
  if (!raw) return "-";
  const d = new Date(raw);
  if (!Number.isFinite(d.getTime())) return "-";
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(d);
}

export function initialsFor(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  const first = parts[0]?.[0] || "";
  const last = parts.length > 1 ? parts[parts.length - 1]?.[0] || "" : "";
  return (first + last).toUpperCase();
}

export function avatarStyle(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = (hash * 31 + name.charCodeAt(i)) % 360;
  }
  const hue = hash;
  return {
    background: `hsl(${hue} 80% 92%)`,
    color: `hsl(${hue} 45% 28%)`,
  };
}

export function runSortTime(run: RunDTO): number {
  const raw = run.createdAt || run.startedAt || run.updatedAt;
  if (!raw) return 0;
  const t = new Date(raw).getTime();
  return Number.isFinite(t) ? t : 0;
}

export function runMeta(run?: RunDTO): RunMeta | null {
  if (!run) return null;
  const when = formatRelative(run.createdAt || run.startedAt || run.updatedAt);

  if (run.status === "success") return { when, icon: "check_circle", label: "Success", className: "text-green" };

  if (run.status === "failed") {
    const firstLine = (run.log || "Failed").split("\n")[0] || "Failed";
    const message = firstLine.length > 28 ? `${firstLine.slice(0, 28)}…` : firstLine;
    return { when, icon: "error", label: message, className: "text-red" };
  }

  if (run.status === "running") return { when, icon: "play_circle", label: "Running", className: "text-accent" };

  return { when, icon: "schedule", label: "Queued", className: "text-muted" };
}
