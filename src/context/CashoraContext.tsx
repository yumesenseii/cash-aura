"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { clearState, loadState, saveState } from "@/lib/storage";
import type {
  CashoraState,
  CreateGoalInput,
  ExpenseCategory,
  Goal,
  Transaction,
  UpdateTransactionInput,
  UserPrefs,
} from "@/lib/types";
import { createEmptyState } from "@/lib/types";
import { dayTotals, todayId, uid } from "@/lib/utils";

type CashoraContextValue = {
  ready: boolean;
  state: CashoraState;
  today: ReturnType<typeof dayTotals> & { dayId: string; hasDay: boolean };
  completeOnboarding: (input: {
    name: string;
    startingCash: number;
    goalName?: string;
    goalTarget?: number;
    saveFirstAmount?: number;
  }) => void;
  setStartingCash: (amount: number) => void;
  addExpense: (input: {
    amount: number;
    category: ExpenseCategory | string;
    note?: string;
  }) => void;
  addSavings: (input: { amount: number; note?: string; goalId?: string }) => void;
  createGoal: (input: CreateGoalInput) => void;
  updateGoal: (id: string, patch: Partial<Goal>) => void;
  deleteGoal: (id: string) => void;
  updateTransaction: (id: string, patch: UpdateTransactionInput) => void;
  deleteTransaction: (id: string) => void;
  updatePrefs: (patch: Partial<UserPrefs>) => void;
  dismissInstallHint: () => void;
  resetAll: () => void;
  ensureToday: (startingCash: number) => void;
};

const CashoraContext = createContext<CashoraContextValue | null>(null);

function adjustGoalSaved(
  goals: Goal[],
  goalId: string | undefined,
  delta: number
): Goal[] {
  if (!goalId || !delta) return goals;
  return goals.map((g) =>
    g.id === goalId
      ? { ...g, currentSaved: Math.max(0, g.currentSaved + delta) }
      : g
  );
}

export function CashoraProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<CashoraState>(createEmptyState);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Load once; never overwrite localStorage with the empty bootstrap state.
    const loaded = loadState();
    setState(loaded);
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    saveState(state);
  }, [state, ready]);

  const persist = useCallback((updater: (prev: CashoraState) => CashoraState) => {
    setState((prev) => updater(prev));
  }, []);

  const ensureToday = useCallback(
    (startingCash: number) => {
      const dayId = todayId();
      persist((prev) => {
        const exists = prev.days.some((d) => d.id === dayId);
        if (exists) {
          return {
            ...prev,
            days: prev.days.map((d) =>
              d.id === dayId ? { ...d, startingCash } : d
            ),
            transactions: [
              ...prev.transactions.filter(
                (t) => !(t.dayId === dayId && t.type === "starting")
              ),
              {
                id: uid("tx"),
                dayId,
                type: "starting" as const,
                amount: startingCash,
                timestamp: new Date().toISOString(),
                category: "Starting",
              },
            ],
          };
        }
        const now = new Date().toISOString();
        return {
          ...prev,
          days: [
            ...prev.days,
            { id: dayId, date: dayId, startingCash, createdAt: now },
          ],
          transactions: [
            ...prev.transactions,
            {
              id: uid("tx"),
              dayId,
              type: "starting" as const,
              amount: startingCash,
              timestamp: now,
              category: "Starting",
            },
          ],
        };
      });
    },
    [persist]
  );

  const completeOnboarding: CashoraContextValue["completeOnboarding"] =
    useCallback(
      ({ name, startingCash, goalName, goalTarget, saveFirstAmount }) => {
        const dayId = todayId();
        const now = new Date().toISOString();
        const goal: Goal | null =
          goalName && goalTarget && goalTarget > 0
            ? {
                id: uid("goal"),
                name: goalName,
                targetAmount: goalTarget,
                currentSaved: saveFirstAmount ?? 0,
                createdAt: now,
                category: "Other",
                icon: "🎯",
              }
            : null;

        const txs: Transaction[] = [
          {
            id: uid("tx"),
            dayId,
            type: "starting",
            amount: startingCash,
            timestamp: now,
            category: "Starting",
          },
        ];

        if (saveFirstAmount && saveFirstAmount > 0) {
          txs.push({
            id: uid("tx"),
            dayId,
            type: "savings",
            amount: saveFirstAmount,
            timestamp: new Date(Date.now() + 1000).toISOString(),
            category: "Savings",
            note: "Savings First",
            goalId: goal?.id,
          });
        }

        persist((prev) => ({
          ...prev,
          prefs: {
            ...prev.prefs,
            name: name.trim(),
            onboardingComplete: true,
          },
          days: [
            ...prev.days.filter((d) => d.id !== dayId),
            { id: dayId, date: dayId, startingCash, createdAt: now },
          ],
          transactions: [
            ...prev.transactions.filter((t) => t.dayId !== dayId),
            ...txs,
          ],
          goals: goal ? [...prev.goals, goal] : prev.goals,
        }));
      },
      [persist]
    );

  const addExpense: CashoraContextValue["addExpense"] = useCallback(
    ({ amount, category, note }) => {
      const dayId = todayId();
      persist((prev) => {
        if (!prev.days.some((d) => d.id === dayId)) return prev;
        return {
          ...prev,
          transactions: [
            ...prev.transactions,
            {
              id: uid("tx"),
              dayId,
              type: "expense",
              amount,
              category,
              note,
              timestamp: new Date().toISOString(),
            },
          ],
        };
      });
    },
    [persist]
  );

  const addSavings: CashoraContextValue["addSavings"] = useCallback(
    ({ amount, note, goalId }) => {
      const dayId = todayId();
      persist((prev) => {
        if (!prev.days.some((d) => d.id === dayId)) return prev;
        const targetGoalId = goalId ?? prev.goals[0]?.id;
        return {
          ...prev,
          goals: adjustGoalSaved(prev.goals, targetGoalId, amount),
          transactions: [
            ...prev.transactions,
            {
              id: uid("tx"),
              dayId,
              type: "savings",
              amount,
              category: "Savings",
              note,
              goalId: targetGoalId,
              timestamp: new Date().toISOString(),
            },
          ],
        };
      });
    },
    [persist]
  );

  const createGoal = useCallback(
    (input: CreateGoalInput) => {
      persist((prev) => ({
        ...prev,
        goals: [
          ...prev.goals,
          {
            id: uid("goal"),
            name: input.name.trim(),
            targetAmount: input.targetAmount,
            currentSaved: Math.max(0, input.currentSaved ?? 0),
            createdAt: new Date().toISOString(),
            targetDate: input.targetDate,
            category: input.category,
            icon: input.icon,
          },
        ],
      }));
    },
    [persist]
  );

  const updateGoal = useCallback(
    (id: string, patch: Partial<Goal>) => {
      persist((prev) => ({
        ...prev,
        goals: prev.goals.map((g) => (g.id === id ? { ...g, ...patch, id } : g)),
      }));
    },
    [persist]
  );

  const deleteGoal = useCallback(
    (id: string) => {
      persist((prev) => ({
        ...prev,
        goals: prev.goals.filter((g) => g.id !== id),
        transactions: prev.transactions.map((t) =>
          t.goalId === id ? { ...t, goalId: undefined } : t
        ),
      }));
    },
    [persist]
  );

  const updateTransaction = useCallback(
    (id: string, patch: UpdateTransactionInput) => {
      persist((prev) => {
        const existing = prev.transactions.find((t) => t.id === id);
        if (!existing) return prev;

        let goals = prev.goals;
        if (existing.type === "savings") {
          const oldGoal = existing.goalId;
          const newGoal =
            patch.goalId === null
              ? undefined
              : patch.goalId !== undefined
                ? patch.goalId
                : existing.goalId;
          const oldAmt = existing.amount;
          const newAmt = patch.amount ?? existing.amount;

          if (oldGoal) goals = adjustGoalSaved(goals, oldGoal, -oldAmt);
          if (newGoal) goals = adjustGoalSaved(goals, newGoal, newAmt);
        }

        const nextTx: Transaction = {
          ...existing,
          amount: patch.amount ?? existing.amount,
          category: patch.category ?? existing.category,
          note: patch.note !== undefined ? patch.note : existing.note,
          timestamp: patch.timestamp ?? existing.timestamp,
          goalId:
            patch.goalId === null
              ? undefined
              : patch.goalId !== undefined
                ? patch.goalId
                : existing.goalId,
        };

        // Keep day startingCash in sync if editing starting tx
        let days = prev.days;
        if (existing.type === "starting" && patch.amount !== undefined) {
          days = prev.days.map((d) =>
            d.id === existing.dayId ? { ...d, startingCash: patch.amount! } : d
          );
        }

        return {
          ...prev,
          goals,
          days,
          transactions: prev.transactions.map((t) =>
            t.id === id ? nextTx : t
          ),
        };
      });
    },
    [persist]
  );

  const deleteTransaction = useCallback(
    (id: string) => {
      persist((prev) => {
        const existing = prev.transactions.find((t) => t.id === id);
        if (!existing) return prev;
        if (existing.type === "starting") return prev; // keep day integrity

        let goals = prev.goals;
        if (existing.type === "savings" && existing.goalId) {
          goals = adjustGoalSaved(goals, existing.goalId, -existing.amount);
        }

        return {
          ...prev,
          goals,
          transactions: prev.transactions.filter((t) => t.id !== id),
        };
      });
    },
    [persist]
  );

  const updatePrefs = useCallback(
    (patch: Partial<UserPrefs>) => {
      persist((prev) => ({
        ...prev,
        prefs: { ...prev.prefs, ...patch },
      }));
    },
    [persist]
  );

  const dismissInstallHint = useCallback(() => {
    updatePrefs({ installedHintSeen: true });
  }, [updatePrefs]);

  const resetAll = useCallback(() => {
    clearState();
    setState(createEmptyState());
  }, []);

  const setStartingCash = useCallback(
    (amount: number) => ensureToday(amount),
    [ensureToday]
  );

  const today = useMemo(() => {
    const dayId = todayId();
    const hasDay = state.days.some((d) => d.id === dayId);
    const totals = dayTotals(dayId, state.transactions);
    return { ...totals, dayId, hasDay };
  }, [state.days, state.transactions]);

  const value: CashoraContextValue = {
    ready,
    state,
    today,
    completeOnboarding,
    setStartingCash,
    addExpense,
    addSavings,
    createGoal,
    updateGoal,
    deleteGoal,
    updateTransaction,
    deleteTransaction,
    updatePrefs,
    dismissInstallHint,
    resetAll,
    ensureToday,
  };

  return (
    <CashoraContext.Provider value={value}>{children}</CashoraContext.Provider>
  );
}

export function useCashora() {
  const ctx = useContext(CashoraContext);
  if (!ctx) throw new Error("useCashora must be used within CashoraProvider");
  return ctx;
}
