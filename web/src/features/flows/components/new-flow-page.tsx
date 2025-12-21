"use client";

import { Button } from "@/shared/components/button";
import { Input } from "@/shared/components/input";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCreateFlow } from "../hooks/use-create-flow";
import { useAppStore } from "@/shared/hooks/use-app-store";

export function NewFlowPage() {
  const [name, setName] = useState("");
  const router = useRouter();
  const { createFlow, loading } = useCreateFlow();
  const showSuccess = useAppStore((s) => s.showSuccess);
  const showError = useAppStore((s) => s.showError);

  const handleCreate = async () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    try {
      const flow = await createFlow(trimmed);
      showSuccess("Flow created", flow.name);
      router.push(`/flows/${flow.id}/builder`);
    } catch (err: any) {
      showError("Create failed", err?.message || "Unable to create flow");
    }
  };

  return (
    <div className="min-h-screen bg-bg">
      <header className="sticky top-0 z-10 bg-panel border-b border-border px-8 py-6">
        <div className="max-w-[900px] mx-auto flex flex-col gap-1">
          <h2 className="text-2xl font-bold tracking-tight text-text">New Flow</h2>
          <p className="text-muted text-sm">Create a new automation.</p>
        </div>
      </header>

      <div className="p-8">
        <div className="max-w-[900px] mx-auto">
          <div className="bg-panel border border-border rounded-xl shadow-soft p-6 space-y-4">
            <label className="block text-sm font-medium text-muted">Flow name</label>
            <Input
              placeholder="My flow"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="h-10 rounded-lg bg-surface2"
            />
            <div className="flex justify-end">
              <Button onClick={handleCreate} disabled={!name.trim() || loading} className="rounded-lg">
                {loading ? "Creating..." : "Create"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
