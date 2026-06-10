import { isAxiosError } from "axios";

export function getErrorMessage(err: unknown, fallback: string): string {
  if (isAxiosError(err)) {
    return err.response?.data?.detail || err.message || fallback;
  }
  if (err instanceof Error) return err.message;
  return fallback;
}
