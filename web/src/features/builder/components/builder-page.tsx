"use client";

import { useBuilderLoad } from "../hooks/use-builder-load";
import { BuilderCanvas } from "./canvas";
import { useEffect } from "react";
import { useBuilderStore } from "../store/use-builder-store";

type Props = { flowId: string };

export function BuilderPage({ flowId }: Props) {
  const { loading } = useBuilderLoad(flowId);
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (useBuilderStore.getState().dirty) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, []);

  if (loading) {
    return (
      <div className="h-[calc(100vh-56px)] flex items-center justify-center text-muted">
        Loading flow...
      </div>
    );
  }

  return <BuilderCanvas />;
}
