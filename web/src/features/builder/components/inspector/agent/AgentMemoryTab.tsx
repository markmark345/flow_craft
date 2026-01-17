"use client";

import { Select } from "@/components/ui/select";

type Props = {
  memoryType: string;
  onUpdateMemory: (type: string) => void;
};

export function AgentMemoryTab({ memoryType, onUpdateMemory }: Props) {
  return (
    <div className="space-y-4">
      <div className="text-sm font-bold text-text">Memory</div>
      <Select
        value={memoryType}
        options={[
          { value: "none", label: "None", description: "No memory between runs" },
          { value: "conversation", label: "Conversation", description: "Keep recent context in memory" },
        ]}
        onChange={onUpdateMemory}
      />
      <div className="text-xs text-muted">Vector stores can be added later.</div>
    </div>
  );
}
