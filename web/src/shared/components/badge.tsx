export function Badge({
  label,
  tone = "default",
}: {
  label: string;
  tone?: "default" | "success" | "warning" | "danger";
}) {
  const toneVar: Record<typeof tone, string> = {
    default: "var(--muted)",
    success: "var(--success)",
    warning: "var(--warning)",
    danger: "var(--error)",
  };
  const c = toneVar[tone] || "var(--muted)";
  return (
    <span
      className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs font-medium border"
      style={{
        background: `color-mix(in srgb, ${c} 14%, transparent)`,
        borderColor: `color-mix(in srgb, ${c} 24%, transparent)`,
        color: c,
      }}
    >
      <span className="size-1.5 rounded-full" style={{ background: c }} />
      {label}
    </span>
  );
}
