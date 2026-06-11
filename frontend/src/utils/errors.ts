import { isAxiosError } from "axios";

function formatAxiosDetail(detail: unknown): string | null {
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail)) {
    return detail
      .map((item) => {
        if (!item || typeof item !== "object") return null;
        const error = item as Record<string, unknown>;
        const path = Array.isArray(error.loc) ? error.loc.join(".") : null;
        const message = typeof error.msg === "string" ? error.msg : null;
        return [path, message].filter(Boolean).join(": ") || null;
      })
      .filter((item): item is string => Boolean(item))
      .join("; ");
  }
  if (detail && typeof detail === "object") {
    const value = detail as Record<string, unknown>;
    if (typeof value.detail === "string") return value.detail;
    if (Array.isArray(value.detail)) return formatAxiosDetail(value.detail);
  }
  return null;
}

export function getErrorMessage(err: unknown, fallback: string): string {
  if (isAxiosError(err)) {
    const detail = formatAxiosDetail(err.response?.data?.detail);
    return detail || err.message || fallback;
  }
  if (err instanceof Error) return err.message;
  return fallback;
}
