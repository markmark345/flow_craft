"use client";

import { useRef } from "react";

import { Input } from "@/shared/components/input";
import { Icon } from "@/shared/components/icon";
import { useAppStore } from "@/shared/hooks/use-app-store";
import { Select, type SelectOption } from "@/shared/components/select";
import { FieldRow } from "./field-row";

export function SlackConfig({
  config,
  onPatch,
}: {
  config: Record<string, unknown>;
  onPatch: (patch: Record<string, unknown>) => void;
}) {
  const showInfo = useAppStore((s) => s.showInfo);
  const messageRef = useRef<HTMLTextAreaElement | null>(null);
  const message = typeof config.message === "string" ? config.message : "";

  const insertVar = (token: string) => {
    const el = messageRef.current;
    if (!el) {
      onPatch({ message: `${message}${token}` });
      return;
    }
    const start = el.selectionStart ?? message.length;
    const end = el.selectionEnd ?? start;
    const next = `${message.slice(0, start)}${token}${message.slice(end)}`;
    onPatch({ message: next });
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(start + token.length, start + token.length);
    });
  };

  return (
    <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
      <div className="space-y-1.5">
        <label className="block text-xs font-bold text-muted">Action Type</label>
        <Select
          value={String(config.actionType || "Post Message")}
          options={
            [
              { value: "Post Message", label: "Post Message" },
              { value: "Upload File", label: "Upload File" },
              { value: "Create Channel", label: "Create Channel" },
            ] satisfies SelectOption[]
          }
          onChange={(next) => onPatch({ actionType: next })}
        />
      </div>

      <div className="space-y-1.5">
        <label className="block text-xs font-bold text-muted">
          Slack Connection <span className="text-red">*</span>
        </label>
        <div className="flex gap-2">
          <Select
            value={String(config.connection || "My Workspace (Default)")}
            options={
              [
                { value: "My Workspace (Default)", label: "My Workspace (Default)" },
                { value: "Marketing Team", label: "Marketing Team" },
              ] satisfies SelectOption[]
            }
            onChange={(next) => onPatch({ connection: next })}
            className="flex-1"
          />
          <button
            type="button"
            className="p-2 rounded-lg bg-surface2 text-muted hover:text-accent hover:bg-surface border border-border transition-colors"
            title="Add connection (coming soon)"
            onClick={() => showInfo("Connections", "Connection management is coming soon.")}
          >
            <Icon name="add" className="text-[20px]" />
          </button>
        </div>
      </div>

      <div className="space-y-1.5">
        <div className="flex justify-between items-center">
          <label className="block text-xs font-bold text-muted">
            Channel ID <span className="text-red">*</span>
          </label>
          <button
            type="button"
            className="text-[10px] text-accent hover:underline font-medium"
            onClick={() => showInfo("Channel picker", "Channel picker is coming soon.")}
          >
            Select from list
          </button>
        </div>
        <div className="relative">
          <Input
            value={String(config.channelId || "")}
            onChange={(e) => onPatch({ channelId: e.target.value })}
            placeholder="#vip-orders"
            className="h-10 rounded-lg bg-surface2 font-mono pr-10"
          />
          <button
            type="button"
            className="absolute right-1.5 top-1.5 p-1 text-muted hover:text-accent hover:bg-surface rounded transition-colors"
            title="Insert variable (coming soon)"
            onClick={() => showInfo("Variables", "Variable picker is coming soon.")}
          >
            <Icon name="data_object" className="text-[18px]" />
          </button>
        </div>
      </div>

      <div className="space-y-1.5">
        <div className="flex justify-between items-center">
          <label className="block text-xs font-bold text-muted">
            Message Text <span className="text-red">*</span>
          </label>
          <span className="text-[10px] text-muted">Markdown supported</span>
        </div>
        <div className="relative group">
          <textarea
            ref={messageRef}
            value={message}
            onChange={(e) => onPatch({ message: e.target.value })}
            className="w-full bg-surface2 border border-border text-text text-sm rounded-lg focus:outline-none focus:shadow-focus font-mono text-xs leading-relaxed p-3 shadow-soft hover:border-border transition-colors resize-none"
            placeholder="Enter your message..."
            rows={8}
          />
          <div className="absolute bottom-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              type="button"
              className="p-1 rounded hover:bg-surface text-muted bg-panel shadow-soft border border-border"
              title="Expand (coming soon)"
              onClick={() => showInfo("Expand", "Expanded editor is coming soon.")}
            >
              <Icon name="open_in_full" className="text-[16px]" />
            </button>
          </div>
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {[
            { label: "trigger.id", token: "{{trigger.id}}" },
            { label: "trigger.total", token: "{{trigger.total}}" },
          ].map((v) => (
            <button
              key={v.label}
              type="button"
              className="px-2 py-0.5 rounded bg-surface2 text-[10px] font-mono border border-border hover:bg-surface transition-colors"
              onClick={() => insertVar(v.token)}
            >
              {v.label}
            </button>
          ))}
        </div>
      </div>

      <FieldRow
        field={{ key: "sendAsBot", label: "Send as bot user", type: "toggle" }}
        value={config.sendAsBot}
        onChange={(v) => onPatch({ sendAsBot: v })}
      />
    </form>
  );
}
