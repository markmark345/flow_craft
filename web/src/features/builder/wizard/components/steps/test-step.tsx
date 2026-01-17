"use client";

import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";

import { useWizardStore } from "../../store/use-wizard-store";

export function WizardTestStep() {
  const runTest = useWizardStore((s) => s.runTest);
  const isTesting = useWizardStore((s) => s.isTesting);
  const result = useWizardStore((s) => s.testResult);

  return (
    <div className="space-y-4">
      <div>
        <div className="text-sm font-semibold text-text">Test (optional)</div>
        <div className="text-xs text-muted">
          Run a safe connectivity test. For write actions, tests avoid destructive operations by default.
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button variant="secondary" onClick={() => runTest()} disabled={isTesting}>
          {isTesting ? "Testing..." : "Run test"}
        </Button>
        {result ? (
          <div
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs"
            style={{
              background: result.success ? "color-mix(in srgb, var(--success) 10%, transparent)" : "color-mix(in srgb, var(--error) 10%, transparent)",
              borderColor: result.success ? "color-mix(in srgb, var(--success) 24%, transparent)" : "color-mix(in srgb, var(--error) 24%, transparent)",
              color: result.success ? "var(--success)" : "var(--error)",
            }}
          >
            <Icon name={result.success ? "check_circle" : "error"} className="text-[16px]" />
            {result.message}
          </div>
        ) : null}
      </div>

      {result?.output ? (
        <div className="rounded-xl border border-border bg-surface2 p-3">
          <div className="text-xs font-bold text-muted mb-2">Output</div>
          <pre className="text-xs text-text whitespace-pre-wrap break-words max-h-72 overflow-auto">
            {JSON.stringify(result.output, null, 2)}
          </pre>
        </div>
      ) : null}
    </div>
  );
}

