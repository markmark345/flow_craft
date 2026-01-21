
export function toStringValue(value: unknown) {
  if (value === null || value === undefined) return "";
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
}

export function coerceKeyValuePairs(value: unknown): Array<{ key: string; value: string }> {
  if (!value) return [];

  if (Array.isArray(value)) {
    return value
      .map((item) => {
        if (!item || typeof item !== "object") return undefined;
        const key = "key" in item ? String((item as any).key || "") : "";
        const val = "value" in item ? toStringValue((item as any).value) : "";
        return { key, value: val };
      })
      .filter(Boolean) as Array<{ key: string; value: string }>;
  }

  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed || trimmed === "{}") return [];
    try {
      const parsed = JSON.parse(trimmed);
      return coerceKeyValuePairs(parsed);
    } catch {
      return [];
    }
  }

  if (typeof value === "object") {
    return Object.entries(value as Record<string, unknown>).map(([k, v]) => ({
      key: k,
      value: toStringValue(v),
    }));
  }

  return [];
}
