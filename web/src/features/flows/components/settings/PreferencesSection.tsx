"use client";

import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Toggle } from "@/components/ui/toggle";
import { Label } from "@/components/ui/label";

type Theme = "light" | "dark";

type Props = {
  theme: Theme | undefined;
  reduceMotion: boolean;
  autoSaveFlows: boolean;
  setTheme: (theme: Theme) => void;
  setReduceMotion: (val: boolean) => void;
  setAutoSaveFlows: (val: boolean) => void;
};

export function PreferencesSection({
  theme,
  reduceMotion,
  autoSaveFlows,
  setTheme,
  setReduceMotion,
  setAutoSaveFlows,
}: Props) {
  return (
    <section className="bg-panel border border-border rounded-xl shadow-soft overflow-hidden">
      <div className="px-6 py-5 border-b border-border">
        <h3 className="text-lg font-semibold text-text">Preferences</h3>
      </div>
      <div className="p-6 space-y-6">
        <div className="space-y-2">
          <Label className="text-sm font-medium">Appearance</Label>
          <div className="flex items-center gap-2 bg-surface2 border border-border rounded-lg p-1">
            <Button
              variant={theme === "light" ? "secondary" : "ghost"}
              className={`flex-1 h-9 gap-2 ${theme === "light" ? "bg-panel shadow-soft" : "text-muted hover:text-text"}`}
              onClick={() => setTheme("light")}
            >
              <Icon name="light_mode" className="text-[18px]" />
              Light
            </Button>
            <Button
              variant={theme === "dark" ? "secondary" : "ghost"}
              className={`flex-1 h-9 gap-2 ${theme === "dark" ? "bg-panel shadow-soft" : "text-muted hover:text-text"}`}
              onClick={() => setTheme("dark")}
            >
              <Icon name="dark_mode" className="text-[18px]" />
              Dark
            </Button>
          </div>
        </div>

        <div className="flex items-center justify-between gap-4">
          <div>
            <div className="text-sm font-medium text-muted">Reduce motion</div>
            <div className="text-xs text-muted">Minimize interface animations</div>
          </div>
          <Toggle checked={reduceMotion} onChange={setReduceMotion} />
        </div>

        <div className="flex items-center justify-between gap-4">
          <div>
            <div className="text-sm font-medium text-muted">Auto-save flows</div>
            <div className="text-xs text-muted">Save changes automatically</div>
          </div>
          <Toggle checked={autoSaveFlows} onChange={setAutoSaveFlows} />
        </div>
      </div>
    </section>
  );
}
