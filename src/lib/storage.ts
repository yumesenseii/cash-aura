import { createEmptyState, type CashoraState } from "./types";

const STORAGE_KEY = "cashora_state_v1";
const BACKUP_KEY = "cashora_state_v1_backup";

function isUsableState(value: unknown): value is Partial<CashoraState> {
  if (!value || typeof value !== "object") return false;
  const obj = value as Record<string, unknown>;
  // Prefer keeping data if it looks like Cashora (even if version is missing)
  return (
    "prefs" in obj ||
    "transactions" in obj ||
    "days" in obj ||
    "goals" in obj ||
    obj.version === 1
  );
}

function normalizeState(parsed: Partial<CashoraState>): CashoraState {
  const empty = createEmptyState();
  return {
    ...empty,
    ...parsed,
    version: 1,
    prefs: { ...empty.prefs, ...(parsed.prefs ?? {}) },
    days: Array.isArray(parsed.days) ? parsed.days : [],
    transactions: Array.isArray(parsed.transactions) ? parsed.transactions : [],
    goals: Array.isArray(parsed.goals) ? parsed.goals : [],
  };
}

function readKey(key: string): CashoraState | null {
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as unknown;
    if (!isUsableState(parsed)) return null;
    return normalizeState(parsed);
  } catch {
    return null;
  }
}

export function loadState(): CashoraState {
  if (typeof window === "undefined") return createEmptyState();
  const primary = readKey(STORAGE_KEY);
  if (primary) return primary;
  const backup = readKey(BACKUP_KEY);
  if (backup) {
    // Restore primary from backup so next saves stay consistent
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(backup));
    } catch {
      /* ignore quota / private mode */
    }
    return backup;
  }
  return createEmptyState();
}

export function saveState(state: CashoraState): void {
  if (typeof window === "undefined") return;
  try {
    const json = JSON.stringify({ ...state, version: 1 });
    window.localStorage.setItem(STORAGE_KEY, json);
    window.localStorage.setItem(BACKUP_KEY, json);
  } catch {
    /* ignore quota / private mode — keep in-memory state */
  }
}

export function clearState(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
    window.localStorage.removeItem(BACKUP_KEY);
  } catch {
    /* ignore */
  }
}
