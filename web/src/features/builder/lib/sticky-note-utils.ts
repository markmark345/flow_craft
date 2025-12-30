import type { StickyNote } from "@/features/builder/types";

export type StickyNoteTheme = "light" | "dark";

export const NOTE_COLOR_OPTIONS: Array<StickyNote["color"]> = ["yellow", "blue", "green"];

export const NOTE_PREVIEW_BG: Record<StickyNote["color"], string> = {
  yellow: "#FEFCE8",
  blue: "#f0f9ff",
  green: "#ecfdf5",
};

export const NOTE_VARIANTS: Record<
  StickyNote["color"],
  {
    light: { bg: string; border: string; fg: string };
    dark: { bg: string; border: string; fg: string };
  }
> = {
  yellow: {
    light: { bg: "#FEFCE8", border: "#FEF08A", fg: "#0f172a" },
    dark: { bg: "#332f0e", border: "#5a521a", fg: "#fefce8" },
  },
  blue: {
    light: { bg: "#f0f9ff", border: "#bae6fd", fg: "#0f172a" },
    dark: { bg: "rgba(12, 74, 110, 0.40)", border: "#075985", fg: "#f8fafc" },
  },
  green: {
    light: { bg: "#ecfdf5", border: "#a7f3d0", fg: "#0f172a" },
    dark: { bg: "#064e3b", border: "#065f46", fg: "#ecfdf5" },
  },
};

export function getNoteAccent(color: StickyNote["color"]) {
  if (color === "green") return "var(--success)";
  if (color === "yellow") return "var(--warning)";
  return "var(--accent)";
}

export function splitTitleAndBody(text: string) {
  const normalized = text.replace(/\r\n/g, "\n");
  const delimiter = "\n\n";
  const idx = normalized.indexOf(delimiter);
  if (idx === -1) return { title: "", body: normalized };
  return { title: normalized.slice(0, idx), body: normalized.slice(idx + delimiter.length) };
}

export function combineTitleAndBody(title: string, body: string) {
  const t = title.replace(/\r\n/g, "\n");
  const b = body.replace(/\r\n/g, "\n");
  if (!t) return b;
  return `${t}\n\n${b}`;
}

export function initialsFor(user?: { name?: string; email?: string }) {
  const name = (user?.name || "").trim();
  if (name) {
    const parts = name.split(/\s+/).filter(Boolean);
    const first = parts[0]?.[0] || "";
    const second = (parts[1]?.[0] || parts[0]?.[1] || "").trim();
    return (first + second).toUpperCase() || "U";
  }
  const email = (user?.email || "").trim();
  if (email) return email.slice(0, 2).toUpperCase();
  return "U";
}

export function formatRelative(iso?: string) {
  if (!iso) return "—";
  const t = new Date(iso).getTime();
  if (!Number.isFinite(t)) return "—";
  const diff = Date.now() - t;
  if (diff < 60_000) return "Just now";
  if (diff < 60 * 60_000) return `${Math.floor(diff / 60_000)} mins ago`;
  if (diff < 24 * 60 * 60_000) return `${Math.floor(diff / (60 * 60_000))} hours ago`;
  return `${Math.floor(diff / (24 * 60 * 60_000))} days ago`;
}
