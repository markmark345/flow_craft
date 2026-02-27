"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { NodeProps } from "reactflow";
import { FlowNodeData } from "../../types";
import { NODE_CATALOG, NODE_CATEGORIES } from "../../types/node-catalog";
import { cn } from "@/lib/cn";
import { BuilderNodeType } from "../../types";
import { useBuilderStore } from "../../store/use-builder-store";
import { NodeIcon } from "./node-icon";
import { Icon } from "@/components/ui/icon";
import { isValidAgentModelConfig } from "../../types/agent";
import { useWizardStore } from "../../wizard/store/use-wizard-store";
import { appLabelFromConfig, actionLabelFromConfig, isAppActionConfigured, getNodeAccent, getNodeIconType } from "../../lib/node-utils";
import { useFlowNode } from "../../hooks/use-flow-node";
import { ModelNode } from "./flow-node/ModelNode";
import { AgentSummary } from "./flow-node/AgentSummary";
import { NodePicker } from "./flow-node/NodePicker";
import { NodeCard } from "./flow-node/NodeCard";
import { NodeHeader } from "./flow-node/NodeHeader";
import { NodeFooter } from "./flow-node/NodeFooter";
import { NodeHandles } from "./flow-node/NodeHandles";

import { useFlowNodeStyles } from "../../hooks/use-flow-node-styles";

export function FlowNode({ id, data, selected }: NodeProps<FlowNodeData>) {
  const {
    meta,
    accentColor,
    isModelNode,
    hasMainInput,
    iconNodeType,
    runtimeTone,
    topBar,
    iconBg,
    iconRing,
  } = useFlowNodeStyles(data);

  const {
    pickerRef,
    pickerOpen,
    query,
    setQuery,
    pickerSourceHandle,
    setPickerOpen,
    groups,
    onQuickAdd,
    setPickerSourceHandle,
  } = useFlowNode(id, data.nodeType, selected);

  const isValid = meta?.validate ? meta.validate(data) : true;
  const flowId = useBuilderStore((s) => s.flowId);
  const openAddAgentTool = useWizardStore((s) => s.openAddAgentTool);

  const setSelectedNode = useBuilderStore((s) => s.setSelectedNode);
  const setAgentInspectorTab = useBuilderStore((s) => s.setAgentInspectorTab);

  const isIf = data.nodeType === "if";
  const branchOffsetPx = 14;
  const ifTrueTop = `calc(50% - ${branchOffsetPx}px)`;
  const ifFalseTop = `calc(50% + ${branchOffsetPx}px)`;
  const popupTop = isIf ? (pickerSourceHandle === "false" ? ifFalseTop : ifTrueTop) : "50%";

  const handleOutsideX = 6;
  const labelOutsideX = 18;

  const outputHandleClass =
    "!w-3 !h-3 !rounded-full !border-[2.5px] shadow-soft cursor-crosshair transition-transform hover:scale-125 relative " +
    "after:content-['+'] after:absolute after:inset-0 after:flex after:items-center after:justify-center " +
    "after:text-[10px] after:font-bold after:text-text after:pointer-events-none after:opacity-0 group-hover:after:opacity-100";

  const inputHandleClass =
    "!w-3 !h-3 !rounded-full !border-[2.5px] shadow-soft cursor-crosshair transition-transform hover:scale-125";

  if (isModelNode) {
    return <ModelNode data={data} selected={selected} handleOutsideX={handleOutsideX} />;
  }

  const handleAgentTabOpen = (tab: "model" | "memory" | "tools") => {
    setSelectedNode(id);
    setAgentInspectorTab(tab);
  };

  const handleAddAgentTool = () => {
    if (!flowId) return;
    openAddAgentTool(flowId, id);
  };

  const handlePickerHandleClick = (sourceHandle?: string) => {
    setPickerSourceHandle(sourceHandle);
    setPickerOpen(true);
  };

  return (
    <NodeCard data={data} selected={selected} accentColor={accentColor} runtimeTone={runtimeTone} topBar={topBar}>
      <div className="p-4">
        <NodeHeader
          data={data}
          accentColor={accentColor}
          iconBg={iconBg}
          iconRing={iconRing}
          iconNodeType={iconNodeType}
          runtimeTone={runtimeTone}
          meta={meta}
        />

        <NodeFooter data={data} isValid={isValid} />
        <AgentSummary
          data={data}
          nodeId={id}
          flowId={flowId}
          onOpenTab={handleAgentTabOpen}
          onAddTool={handleAddAgentTool}
        />
      </div>

      <NodeHandles
        hasMainInput={hasMainInput}
        isIf={isIf}
        accentColor={accentColor}
        handleOutsideX={handleOutsideX}
        labelOutsideX={labelOutsideX}
        ifTrueTop={ifTrueTop}
        ifFalseTop={ifFalseTop}
        inputHandleClass={inputHandleClass}
        outputHandleClass={outputHandleClass}
        pickerRef={pickerRef}
        onHandleClick={handlePickerHandleClick}
        isErrorBranchEnabled={!!data.config?.enableErrorBranch}
      />

      <NodePicker
        isOpen={pickerOpen}
        query={query}
        groups={groups}
        popupTop={popupTop}
        accentVar={{}} // Passed but mostly handled in styles hook
        onQueryChange={setQuery}
        onQuickAdd={onQuickAdd}
        onMouseDown={(e) => e.stopPropagation()}
        onClick={(e) => e.stopPropagation()}
      />
    </NodeCard>
  );
}
