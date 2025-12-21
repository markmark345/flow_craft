import { useEffect } from "react";

export function useHotkeys(keys: string[], handler: () => void) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const combo = `${e.ctrlKey ? "ctrl+" : ""}${e.metaKey ? "meta+" : ""}${e.shiftKey ? "shift+" : ""}${e.key.toLowerCase()}`;
      if (keys.includes(combo)) {
        e.preventDefault();
        handler();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [keys, handler]);
}
