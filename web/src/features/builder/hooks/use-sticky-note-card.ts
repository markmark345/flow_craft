import { useMemo } from "react";
import { splitTitleAndBody } from "../lib/sticky-note-utils";

export interface UseStickyNoteCardReturn {
  titleBody: { title: string; body: string };
}

/**
 * Custom hook for managing sticky note card text splitting.
 * Parses note text into title and body parts.
 */
export function useStickyNoteCard(noteText: string): UseStickyNoteCardReturn {
  const titleBody = useMemo(() => splitTitleAndBody(noteText), [noteText]);

  return {
    titleBody,
  };
}
