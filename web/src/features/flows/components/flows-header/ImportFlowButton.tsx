"use client";

import { RefObject } from "react";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Input } from "@/components/ui/input";

interface ImportFlowButtonProps {
  importing: boolean;
  onImportClick: () => void;
  fileRef: RefObject<HTMLInputElement | null>;
  handleImportFile: (file: File) => Promise<void> | void;
}

export function ImportFlowButton({
  importing,
  onImportClick,
  fileRef,
  handleImportFile,
}: ImportFlowButtonProps) {
  return (
    <>
      <Button variant="secondary" size="md" className="h-10 px-4 rounded-lg" onClick={onImportClick}>
        <Icon name="download" className="text-[20px] mr-2" />
        {importing ? "Importing..." : "Import Flow"}
      </Button>
      <Input
        ref={fileRef}
        type="file"
        accept="application/json"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) void handleImportFile(f);
        }}
      />
    </>
  );
}
