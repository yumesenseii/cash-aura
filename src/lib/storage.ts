import { createEmptyState, type CashoraState } from "./types";

const STORAGE_KEY = "cashora_state_v1";

export function loadState(): CashoraState {
  if (typeof window === "undefined") return createEmptyState();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return createEmptyState();
    const parsed = JSON.parse(raw) as CashoraState;
    if (!parsed || parsed.version !== 1) return createEmptyState();
    return {
      ...createEmptyState(),
      ...parsed,
      prefs: { ...createEmptyState().prefs, ...parsed.prefs },
      days: parsed.days ?? [],
      transactions: parsed.transactions ?? [],
      goals: parsed.goals ?? [],
    };
  } catch {
    return createEmptyState();
  }
}

export function saveState(state: CashoraState): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function clearState(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(STORAGE_KEY);
}
