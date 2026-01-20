"use client";
import { getErrorMessage } from "@/lib/error-utils";

import { useEffect, useMemo, useState } from "react";
import { CredentialDTO } from "@/types/dto";
import { listCredentials } from "../services/credentialsApi";
import { useWorkspaceStore } from "@/features/workspaces/store/use-workspace-store";

export type CredentialOption = {
  id: string;
  label: string;
  provider: string;
  accountEmail?: string;
  scope: "personal" | "project";
  projectId?: string;
};

export function useCredentialOptions(provider?: string, enabled = true) {
  const scope = useWorkspaceStore((s) => s.activeScope);
  const projectId = useWorkspaceStore((s) => s.activeProjectId);
  const [items, setItems] = useState<CredentialDTO[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!enabled) {
      setItems([]);
      setLoading(false);
      setError(null);
      return;
    }
    let mounted = true;
    const load = async () => {
      if (scope === "project" && !projectId) {
        setItems([]);
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const data = await listCredentials(scope, projectId || undefined);
        if (!mounted) return;
        setItems(data);
      } catch (err: unknown) {
        if (!mounted) return;
        setError(getErrorMessage(err) || "Failed to load credentials");
        setItems([]);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, [projectId, scope]);

  const options = useMemo(() => {
    const filtered = provider
      ? items.filter((item) => item.provider.toLowerCase() === provider.toLowerCase())
      : items;
    return filtered.map((item) => ({
      id: item.id,
      label: item.name || `${item.provider}: ${item.accountEmail || "Connected account"}`,
      provider: item.provider,
      accountEmail: item.accountEmail,
      scope: item.scope,
      projectId: item.projectId,
    }));
  }, [items, provider]);

  return { options, loading, error };
}
