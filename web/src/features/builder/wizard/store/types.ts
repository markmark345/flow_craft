
import { AppKey } from "../../nodeCatalog/catalog";
import { AgentMemoryConfig, AgentModelConfig, AgentToolConfig } from "../../types/agent";

export type WizardMode = "add-app-node" | "add-agent" | "add-agent-tool";

export type WizardTestResult = {
  success: boolean;
  message: string;
  preview?: unknown;
  output?: unknown;
};

export type BaseState = {
  isOpen: boolean;
  mode: WizardMode;
  flowId?: string;
  stepIndex: number;
  validationErrors: Record<string, string>;
  testResult: WizardTestResult | null;
  isTesting: boolean;
  isSubmitting: boolean;
};

export type AppNodeDraft = {
  label: string;
  app: AppKey | null;
  action: string | null;
  config: Record<string, unknown>;
};

export type AgentDraft = {
  label: string;
  config: Record<string, unknown>;
  model: AgentModelConfig | null;
  memory: AgentMemoryConfig | null;
  tools: AgentToolConfig[];
};

export type AgentToolDraft = {
  agentNodeId: string;
  toolKey: string | null;
  config: Record<string, unknown>;
};

export type Draft = AppNodeDraft | AgentDraft | AgentToolDraft;

export type AppSlice = {
  runAppTest: () => Promise<WizardTestResult>;
  confirmAppNode: () => void;
};

export type AgentSlice = {
  runAgentTest: () => Promise<WizardTestResult>;
  confirmAgent: () => void;
};

export type ToolSlice = {
  runToolTest: () => Promise<WizardTestResult>;
  confirmTool: () => void;
};

export type CommonSlice = BaseState & {
  draft: Draft;
  openAddAppNode: (flowId: string, presetApp?: AppKey, presetAction?: string) => void;
  openAddAgent: (flowId: string) => void;
  openAddAgentTool: (flowId: string, agentNodeId: string) => void;
  close: () => void;
  nextStep: () => void;
  prevStep: () => void;
  setDraft: (patch: Partial<Draft> & { config?: Record<string, unknown> }) => void;
  setValidationErrors: (errors: Record<string, string>) => void;
};

export type CentralActions = {
  validateCurrentStep: () => boolean;
  runTest: () => Promise<void>;
  confirm: () => Promise<void>;
};

export type WizardState = CommonSlice & AppSlice & AgentSlice & ToolSlice & CentralActions;
