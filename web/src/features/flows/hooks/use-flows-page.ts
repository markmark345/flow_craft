import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useFlowsQuery } from "./use-flows";
import { useFlowActions } from "./use-flow-actions";
import { useFlowsStore } from "../store/use-flows-store";
import { useRunsQuery } from "@/features/runs/hooks/use-runs";
import { useRunFlow } from "@/features/runs/hooks/use-run-flow";
import { useRunsStore } from "@/features/runs/store/use-runs-store";
import { useAppStore, useMounted } from "@/hooks/use-app-store";
import type { FlowDTO, RunDTO, ProjectDTO } from "@/types/dto";
import { useWorkspaceStore } from "@/features/workspaces/store/use-workspace-store";
import { ownerForFlow, runMeta, runSortTime } from "../lib/flow-utils";

type ConfirmState = { type: "archive" | "delete"; flow: FlowDTO } | null;

export interface UseFlowsPageReturn {
  // Loading states
  flowsLoading: boolean;
  runsLoading: boolean;
  flowsError: string | undefined;
  importing: boolean;
  duplicatingId: string | undefined;
  archivingId: string | undefined;
  deletingId: string | undefined;
  running: boolean;
  runningFlowId: string | undefined;

  // Data
  flows: FlowDTO[];
  filtered: FlowDTO[];
  pageItems: FlowDTO[];
  pageCount: number;
  page: number;
  pageSize: number;
  pageStartIdx: number;
  pageSafe: number;

  // Filters
  query: string;
  status: "all" | FlowDTO["status"];
  owner: string;
  ownerOptions: string[];

  // Messages
  showSuccess: (title: string, message: string) => void;
  showError: (title: string, message: string) => void;
  showInfo: (title: string, message: string) => void;

  // Selection
  selectedIds: Set<string>;
  allSelectedOnPage: boolean;

  // Workspace
  scope: "personal" | "project";
  activeProject: ProjectDTO | null;
  pageTitle: string;
  pageSubtitle: string;
  canCreateProject: boolean;
  projectLabel: string;

  // Confirm dialog
  confirm: ConfirmState;
  confirmTitle: string;
  confirmDesc: string | undefined;
  confirmLoading: boolean;

  // Actions
  setQuery: (query: string) => void;
  setStatus: (status: "all" | FlowDTO["status"]) => void;
  setOwner: (owner: string) => void;
  setPageSize: (size: number) => void;
  setPage: (page: number) => void;
  toggleSelectFlow: (flowId: string, next?: boolean) => void;
  toggleSelectAllOnPage: () => void;
  onImportFile: (file: File) => Promise<void>;
  onReload: () => void;
  onRunFlow: (flowId: string) => Promise<void>;
  runMetaForFlow: (flowId: string) => ReturnType<typeof runMeta>;
  setConfirm: (confirm: ConfirmState) => void;
  onConfirm: () => Promise<void>;
  onCreatePersonal: () => void;
  onCreateProject: () => void;
}

/**
 * Custom hook for managing Flows Page state and logic.
 * Handles flow listing, filtering, pagination, selection, and actions.
 */
export function useFlowsPage(): UseFlowsPageReturn {
  const router = useRouter();
  const mounted = useMounted();

  // Data queries
  const { loading: flowsLoading, error: flowsError, reload: reloadFlows } = useFlowsQuery();
  const { loading: runsLoading, reload: reloadRuns } = useRunsQuery();
  const flows = useFlowsStore((s) => s.items);
  const runs = useRunsStore((s) => s.items);

  // Workspace state
  const scopeRaw = useWorkspaceStore((s) => s.activeScope);
  const activeProjectIdRaw = useWorkspaceStore((s) => s.activeProjectId);
  const projects = useWorkspaceStore((s) => s.projects);
  const scope = mounted ? scopeRaw : "personal";
  const activeProjectId = mounted ? activeProjectIdRaw : null;
  const activeProject = useMemo(
    () => projects.find((p) => p.id === activeProjectId) || null,
    [activeProjectId, projects]
  );

  // UI messages
  const showSuccess = useAppStore((s) => s.showSuccess);
  const showError = useAppStore((s) => s.showError);
  const showInfo = useAppStore((s) => s.showInfo);

  // Flow actions
  const {
    importFlowFromFile,
    importing,
    duplicateExistingFlow,
    duplicatingId,
    archiveExistingFlow,
    archivingId,
    deleteExistingFlow,
    deletingId,
  } = useFlowActions();
  const { startRun, running, runningFlowId } = useRunFlow();

  // Local state - filters
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<"all" | FlowDTO["status"]>("all");
  const [owner, setOwner] = useState<string>("all");
  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState(() => new Set<string>());
  const [confirm, setConfirm] = useState<ConfirmState>(null);

  // Owner options from flows
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

  // Last run by flow ID
  const lastRunByFlowId = useMemo(() => {
    const map = new Map<string, RunDTO>();
    for (const run of runs) {
      const t = runSortTime(run);
      const existing = map.get(run.flowId);
      if (!existing || t > runSortTime(existing)) map.set(run.flowId, run);
    }
    return map;
  }, [runs]);

  const runMetaForFlow = (flowId: string) => runMeta(lastRunByFlowId.get(flowId));

  // Filtered and sorted flows
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return flows
      .filter((flow) => (status === "all" ? true : flow.status === status))
      .filter((flow) => (owner === "all" ? true : ownerForFlow(flow) === owner))
      .filter((flow) => (!q ? true : flow.name.toLowerCase().includes(q) || flow.id.toLowerCase().includes(q)))
      .sort((a, b) => (b.updatedAt || "").localeCompare(a.updatedAt || ""));
  }, [flows, owner, query, status]);

  // Reset page when filters change
  useEffect(() => setPage(1), [query, status, owner, pageSize]);

  // Pagination
  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const pageSafe = Math.min(page, pageCount);
  const pageStartIdx = (pageSafe - 1) * pageSize;
  const pageItems = filtered.slice(pageStartIdx, pageStartIdx + pageSize);

  // Adjust page if out of range
  useEffect(() => {
    if (page !== pageSafe) setPage(pageSafe);
  }, [page, pageSafe]);

  // Selection state
  const allSelectedOnPage = pageItems.length > 0 && pageItems.every((flow) => selectedIds.has(flow.id));

  const toggleSelectFlow = (flowId: string, next?: boolean) => {
    setSelectedIds((prev) => {
      const copy = new Set(prev);
      const shouldSelect = next ?? !copy.has(flowId);
      if (shouldSelect) copy.add(flowId);
      else copy.delete(flowId);
      return copy;
    });
  };

  const toggleSelectAllOnPage = () => {
    setSelectedIds((prev) => {
      const copy = new Set(prev);
      const shouldSelectAll = !allSelectedOnPage;
      for (const flow of pageItems) {
        if (shouldSelectAll) copy.add(flow.id);
        else copy.delete(flow.id);
      }
      return copy;
    });
  };

  // Actions
  const onImportFile = async (file: File) => {
    const { flow } = await importFlowFromFile(file);
    router.push(`/flows/${flow.id}/builder`);
  };

  const onReload = () => {
    reloadFlows();
    reloadRuns();
  };

  const onRunFlow = async (flowId: string) => {
    try {
      const run = await startRun(flowId);
      showSuccess("Run started", run.id.slice(0, 8));
      router.push(`/runs/${run.id}`);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unable to start run";
      showError("Run failed", errorMessage);
    }
  };

  // Confirm dialog state
  const confirmTitle =
    confirm?.type === "archive" ? "Archive flow?" : confirm?.type === "delete" ? "Delete flow?" : "";

  const confirmDesc =
    confirm?.type === "archive"
      ? `This will mark "${confirm.flow.name}" as archived.`
      : confirm?.type === "delete"
        ? `This will permanently delete "${confirm.flow.name}".`
        : undefined;

  const confirmLoading =
    (confirm?.type === "archive" && archivingId === confirm.flow.id) ||
    (confirm?.type === "delete" && deletingId === confirm.flow.id);

  const onConfirm = async () => {
    if (!confirm) return;
    try {
      if (confirm.type === "archive") await archiveExistingFlow(confirm.flow);
      if (confirm.type === "delete") await deleteExistingFlow(confirm.flow);
      setConfirm(null);
    } catch {
      // toasts handled by hooks
    }
  };

  // Workspace-specific data
  const pageTitle =
    scope === "project" ? (activeProject ? `Project: ${activeProject.name}` : "Project Workflows") : "Personal Workflows";
  const pageSubtitle =
    scope === "project"
      ? activeProject
        ? "Workflows shared within this project."
        : "Select a project to view project workflows."
      : "Workflows owned by you.";

  const canCreateProject = scope === "project" && Boolean(activeProjectId);
  const projectLabel =
    scope === "project" && activeProject ? `Project workflow (${activeProject.name})` : "Project workflow";

  const onCreatePersonal = () => router.push("/flows/new?scope=personal");
  const onCreateProject = () => {
    if (!activeProjectId) return;
    router.push(`/flows/new?scope=project&projectId=${encodeURIComponent(activeProjectId)}`);
  };

  return {
    // Loading states
    flowsLoading,
    runsLoading,
    flowsError,
    importing,
    duplicatingId,
    archivingId,
    deletingId,
    running,
    runningFlowId,

    // Data
    flows,
    filtered,
    pageItems,
    pageCount,
    page,
    pageSize,
    pageStartIdx,
    pageSafe,

    // Filters
    query,
    status,
    owner,
    ownerOptions,

    // Messages
    showSuccess,
    showError,
    showInfo,

    // Selection
    selectedIds,
    allSelectedOnPage,

    // Workspace
    scope,
    activeProject,
    pageTitle,
    pageSubtitle,
    canCreateProject,
    projectLabel,

    // Confirm dialog
    confirm,
    confirmTitle,
    confirmDesc,
    confirmLoading,

    // Actions
    setQuery,
    setStatus,
    setOwner,
    setPageSize,
    setPage,
    toggleSelectFlow,
    toggleSelectAllOnPage,
    onImportFile,
    onReload,
    onRunFlow,
    runMetaForFlow,
    setConfirm,
    onConfirm,
    onCreatePersonal,
    onCreateProject,
  };
}
