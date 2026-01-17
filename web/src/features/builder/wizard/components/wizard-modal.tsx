"use client";

import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { IconButton } from "@/components/ui/icon-button";
import { cn } from "@/lib/cn";
import { useWizardStore } from "../store/use-wizard-store";
import { useWizardModal } from "../hooks/use-wizard-modal";
import { AppSelectStep } from "./steps/app-select-step";
import { ActionSelectStep } from "./steps/action-select-step";
import { WizardCredentialStep } from "./steps/credential-step";
import { WizardConfigureStep } from "./steps/configure-step";
import { WizardTestStep } from "./steps/test-step";
import { AppReviewStep } from "./steps/review-app-step";
import { AgentBasicsStep } from "./steps/agent-basics-step";
import { AgentModelStep } from "./steps/agent-model-step";
import { AgentMemoryStep } from "./steps/agent-memory-step";
import { AgentToolsStep } from "./steps/agent-tools-step";
import { AgentReviewStep } from "./steps/review-agent-step";
import { ToolSelectStep } from "./steps/tool-select-step";
import { ToolReviewStep } from "./steps/review-tool-step";

export function WizardModal() {
  const isOpen = useWizardStore((s) => s.isOpen);
  const mode = useWizardStore((s) => s.mode);
  const stepIndex = useWizardStore((s) => s.stepIndex);
  const close = useWizardStore((s) => s.close);
  const nextStep = useWizardStore((s) => s.nextStep);
  const prevStep = useWizardStore((s) => s.prevStep);
  const isTesting = useWizardStore((s) => s.isTesting);
  const isSubmitting = useWizardStore((s) => s.isSubmitting);
  const confirm = useWizardStore((s) => s.confirm);

  const { steps, isLast, confirmLabel } = useWizardModal(mode, stepIndex);

  const renderStep = () => {
    if (mode === "add-agent") {
      if (stepIndex === 0) return <AgentBasicsStep />;
      if (stepIndex === 1) return <AgentModelStep />;
      if (stepIndex === 2) return <AgentMemoryStep />;
      if (stepIndex === 3) return <AgentToolsStep />;
      return <AgentReviewStep />;
    }

    if (mode === "add-agent-tool") {
      if (stepIndex === 0) return <ToolSelectStep />;
      if (stepIndex === 1) return <WizardCredentialStep />;
      if (stepIndex === 2) return <WizardConfigureStep />;
      if (stepIndex === 3) return <WizardTestStep />;
      return <ToolReviewStep />;
    }

    if (stepIndex === 0) return <AppSelectStep />;
    if (stepIndex === 1) return <ActionSelectStep />;
    if (stepIndex === 2) return <WizardCredentialStep />;
    if (stepIndex === 3) return <WizardConfigureStep />;
    if (stepIndex === 4) return <WizardTestStep />;
    return <AppReviewStep />;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-6">
      <div className="w-[980px] max-w-[calc(100vw-48px)] h-[680px] max-h-[calc(100vh-48px)] bg-panel border border-border rounded-2xl shadow-lift flex overflow-hidden">
        <div className="w-56 border-r border-border bg-surface2 p-4 flex flex-col">
          <div className="text-sm font-bold text-text mb-4">
            {mode === "add-agent"
              ? "Add AI Agent"
              : mode === "add-agent-tool"
                ? "Add Tool"
                : "Add App Action"}
          </div>

          <div className="space-y-2">
            {steps.map((s, idx) => {
              const active = idx === stepIndex;
              const done = idx < stepIndex;
              return (
                <div
                  key={s.key}
                  className={cn(
                    "flex items-center gap-2 rounded-lg px-3 py-2 text-sm border",
                    active
                      ? "bg-panel border-accent text-text"
                      : done
                        ? "bg-panel/40 border-border text-text"
                        : "bg-transparent border-transparent text-muted"
                  )}
                >
                  <span
                    className={cn(
                      "h-5 w-5 rounded-full flex items-center justify-center border",
                      active ? "border-accent text-accent" : done ? "border-green text-green" : "border-border text-muted"
                    )}
                  >
                    <Icon name={done ? "check" : "chevron_right"} className="text-[16px]" />
                  </span>
                  <span className="font-semibold">{s.title}</span>
                </div>
              );
            })}
          </div>

          <div className="mt-auto pt-4 text-[11px] text-muted">
            Tip: You can always edit node settings later in the Inspector panel.
          </div>
        </div>

        <div className="flex-1 flex flex-col min-w-0">
          <div className="px-6 py-4 border-b border-border flex items-center justify-between">
            <div className="min-w-0">
              <div className="text-sm font-bold text-text truncate">{steps[stepIndex]?.title}</div>
              <div className="text-xs text-muted">Step {stepIndex + 1} of {steps.length}</div>
            </div>
            <IconButton
              icon="close"
              className="h-9 w-9 border border-border bg-surface2 text-muted hover:text-text hover:bg-surface transition-colors"
              onClick={close}
              title="Close"
            />
          </div>

          <div className="flex-1 overflow-auto px-6 py-5">{renderStep()}</div>

          <div className="px-6 py-4 border-t border-border flex items-center justify-between bg-surface2">
            <Button variant="ghost" onClick={close} disabled={isTesting || isSubmitting}>
              Cancel
            </Button>
            <div className="flex items-center gap-2">
              <Button variant="secondary" onClick={prevStep} disabled={stepIndex === 0 || isTesting || isSubmitting}>
                Back
              </Button>
              {isLast ? (
                <Button
                  variant="primary"
                  onClick={() => confirm()}
                  disabled={isTesting || isSubmitting}
                >
                  {isSubmitting ? "Adding..." : confirmLabel}
                </Button>
              ) : (
                <Button variant="primary" onClick={nextStep} disabled={isTesting || isSubmitting}>
                  Next
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
