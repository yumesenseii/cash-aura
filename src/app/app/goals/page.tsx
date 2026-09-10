"use client";

import { useMemo, useState } from "react";
import { AddSavingsModal } from "@/components/AddSavingsModal";
import { Modal } from "@/components/Modal";
import { PageHeader, Surface } from "@/components/ui/Surface";
import { RingProgress } from "@/components/ui/RingProgress";
import { useCashora } from "@/context/CashoraContext";
import { COPY, GOAL_TEMPLATES } from "@/lib/content";
import {
  GOAL_CATEGORIES,
  GOAL_CATEGORY_ICONS,
  type Goal,
  type GoalCategory,
} from "@/lib/types";
import {
  formatLongDate,
  formatPeso,
  goalMilestones,
  goalRemaining,
  monthStartId,
  savingsPace,
  todayId,
} from "@/lib/utils";

export default function GoalsPage() {
  const { state, createGoal, updateGoal, deleteGoal, addSavings } =
    useCashora();
  const [showForm, setShowForm] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [savingsOpen, setSavingsOpen] = useState(false);
  const [activeGoalId, setActiveGoalId] = useState<string | undefined>();

  const overview = useMemo(() => {
    const totalSaved = state.goals.reduce((s, g) => s + g.currentSaved, 0);
    const active = state.goals.filter(
      (g) => g.currentSaved < g.targetAmount
    ).length;
    const monthStart = monthStartId();
    const today = todayId();
    const savedThisMonth = state.transactions
      .filter(
        (t) =>
          t.type === "savings" &&
          t.dayId >= monthStart &&
          t.dayId <= today
      )
      .reduce((s, t) => s + t.amount, 0);
    return { totalSaved, active, savedThisMonth };
  }, [state.goals, state.transactions]);

  const activeGoals = state.goals.filter(
    (g) => g.currentSaved < g.targetAmount
  );
  const completedGoals = state.goals.filter(
    (g) => g.currentSaved >= g.targetAmount
  );

  function openCreateFromTemplate(t: (typeof GOAL_TEMPLATES)[number]) {
    setEditingGoal(null);
    setShowForm(true);
    // prefill via session - we'll use form defaults through a draft state
    setDraft({
      name: t.name,
      targetAmount: String(t.targetAmount),
      currentSaved: "0",
      targetDate: "",
      category: "Other",
    });
  }

  const [draft, setDraft] = useState({
    name: "",
    targetAmount: "",
    currentSaved: "0",
    targetDate: "",
    category: "Other" as GoalCategory,
  });

  function openCreate() {
    setEditingGoal(null);
    setDraft({
      name: "",
      targetAmount: "",
      currentSaved: "0",
      targetDate: "",
      category: "Other",
    });
    setShowForm(true);
  }

  function openEdit(goal: Goal) {
    setEditingGoal(goal);
    setDraft({
      name: goal.name,
      targetAmount: String(goal.targetAmount),
      currentSaved: String(goal.currentSaved),
      targetDate: goal.targetDate || "",
      category: goal.category || "Other",
    });
    setShowForm(true);
  }

  const livePace = useMemo(() => {
    const target = Number(draft.targetAmount) || 0;
    const current = Number(draft.currentSaved) || 0;
    return savingsPace({
      id: "draft",
      name: draft.name,
      targetAmount: target,
      currentSaved: current,
      createdAt: "",
      targetDate: draft.targetDate || undefined,
      category: draft.category,
    });
  }, [draft]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const target = Number(draft.targetAmount);
    const current = Number(draft.currentSaved) || 0;
    if (!draft.name.trim() || !target || target <= 0) return;

    const icon = GOAL_CATEGORY_ICONS[draft.category];
    if (editingGoal) {
      updateGoal(editingGoal.id, {
        name: draft.name.trim(),
        targetAmount: target,
        currentSaved: Math.max(0, current),
        targetDate: draft.targetDate || undefined,
        category: draft.category,
        icon,
      });
    } else {
      createGoal({
        name: draft.name.trim(),
        targetAmount: target,
        currentSaved: Math.max(0, current),
        targetDate: draft.targetDate || undefined,
        category: draft.category,
        icon,
      });
    }
    setShowForm(false);
    setEditingGoal(null);
  }

  return (
    <div className="space-y-4">
      <PageHeader
        title="Goals"
        subtitle="What am I saving for?"
        eyebrow="Savings goals"
      />

      <Surface className="fade-up p-4">
        <p className="text-xs font-bold uppercase tracking-wide text-[var(--color-deep)]/45">
          Savings overview
        </p>
        <div className="mt-3 grid grid-cols-3 gap-2 text-center">
          <div className="rounded-xl bg-[var(--color-mist)]/50 px-2 py-2">
            <p className="text-[10px] uppercase text-[var(--color-deep)]/45">
              Total saved
            </p>
            <p className="font-bold tabular-nums text-[var(--color-deep)]">
              {formatPeso(overview.totalSaved)}
            </p>
          </div>
          <div className="rounded-xl bg-[var(--color-mist)]/50 px-2 py-2">
            <p className="text-[10px] uppercase text-[var(--color-deep)]/45">
              Active
            </p>
            <p className="font-bold text-[var(--color-deep)]">
              {overview.active}
            </p>
          </div>
          <div className="rounded-xl bg-[var(--color-mist)]/50 px-2 py-2">
            <p className="text-[10px] uppercase text-[var(--color-deep)]/45">
              This month
            </p>
            <p className="font-bold tabular-nums text-[var(--color-deep)]">
              {formatPeso(overview.savedThisMonth)}
            </p>
          </div>
        </div>
      </Surface>

      <Surface className="fade-up p-4">
        <p className="text-sm font-semibold text-[var(--color-deep)]">
          {COPY.suggestedGoals}
        </p>
        <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
          {GOAL_TEMPLATES.map((t) => (
            <button
              key={t.name}
              type="button"
              onClick={() => openCreateFromTemplate(t)}
              className="min-w-[9.5rem] shrink-0 cursor-pointer rounded-2xl border border-[var(--color-deep)]/10 bg-[var(--color-mist)]/50 px-3 py-3 text-left transition hover:bg-[var(--color-mist)]"
            >
              <p className="text-sm font-semibold text-[var(--color-deep)]">
                {t.name}
              </p>
              <p className="mt-1 text-xs text-[var(--color-deep)]/55">{t.blurb}</p>
              <p className="mt-2 text-sm font-bold tabular-nums text-[var(--color-deep)]">
                {formatPeso(t.targetAmount)}
              </p>
            </button>
          ))}
        </div>
      </Surface>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold uppercase tracking-wide text-[var(--color-deep)]/55">
            Active goals
          </h2>
          <button
            type="button"
            onClick={openCreate}
            className="cursor-pointer text-sm font-semibold text-[var(--color-deep)] underline-offset-2 hover:underline"
          >
            {COPY.createGoal}
          </button>
        </div>

        {activeGoals.length === 0 ? (
          <Surface className="p-6 text-center">
            <p className="text-lg font-semibold text-[var(--color-deep)]">
              {COPY.goalsEmptyTitle}
            </p>
            <p className="mt-2 text-sm text-[var(--color-deep)]/65">
              {COPY.goalsEmptyBody}
            </p>
            <button
              type="button"
              onClick={openCreate}
              className="btn-save mt-5 w-full cursor-pointer rounded-2xl py-3.5 font-semibold text-white"
            >
              {COPY.createGoal}
            </button>
          </Surface>
        ) : (
          activeGoals.map((goal) => (
            <GoalCard
              key={goal.id}
              goal={goal}
              onAdd={() => {
                setActiveGoalId(goal.id);
                setSavingsOpen(true);
              }}
              onEdit={() => openEdit(goal)}
              onDelete={() => {
                if (window.confirm(`Delete goal “${goal.name}”?`)) {
                  deleteGoal(goal.id);
                }
              }}
            />
          ))
        )}
      </section>

      {completedGoals.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-sm font-bold uppercase tracking-wide text-[var(--color-deep)]/55">
            Completed goals
          </h2>
          {completedGoals.map((goal) => (
            <Surface key={goal.id} className="fade-up p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-[var(--color-deep)]">
                    {goal.icon || "🎧"} {goal.name}
                  </p>
                  <p className="mt-1 text-sm text-[var(--color-deep)]/60">
                    {formatPeso(goal.currentSaved)} /{" "}
                    {formatPeso(goal.targetAmount)}
                  </p>
                  <p className="mt-2 text-sm font-medium text-[var(--color-soft)]">
                    ✓ Goal completed
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm(`Delete goal “${goal.name}”?`)) {
                      deleteGoal(goal.id);
                    }
                  }}
                  className="cursor-pointer text-xs font-semibold text-red-700"
                >
                  Delete
                </button>
              </div>
            </Surface>
          ))}
        </section>
      )}

      <Modal
        open={showForm}
        title={editingGoal ? "Edit goal" : "Create a goal"}
        onClose={() => {
          setShowForm(false);
          setEditingGoal(null);
        }}
      >
        <form onSubmit={handleSubmit} className="space-y-3">
          <Field
            label="Goal name"
            value={draft.name}
            onChange={(v) => setDraft((d) => ({ ...d, name: v }))}
            placeholder="e.g. OJT Expenses"
          />
          <Field
            label="Target amount (₱)"
            value={draft.targetAmount}
            onChange={(v) => setDraft((d) => ({ ...d, targetAmount: v }))}
            placeholder="10000"
            inputMode
          />
          <Field
            label="Current amount (₱)"
            value={draft.currentSaved}
            onChange={(v) => setDraft((d) => ({ ...d, currentSaved: v }))}
            placeholder="0"
            inputMode
          />
          <label className="block text-sm">
            <span className="mb-1 block text-[var(--color-deep)]/70">
              Target date
            </span>
            <input
              type="date"
              value={draft.targetDate}
              onChange={(e) =>
                setDraft((d) => ({ ...d, targetDate: e.target.value }))
              }
              className="w-full cursor-pointer rounded-xl border border-[var(--color-deep)]/12 bg-[var(--color-cream)] px-3 py-2.5 outline-none"
            />
          </label>
          <label className="block text-sm">
            <span className="mb-1 block text-[var(--color-deep)]/70">
              Category
            </span>
            <select
              value={draft.category}
              onChange={(e) =>
                setDraft((d) => ({
                  ...d,
                  category: e.target.value as GoalCategory,
                }))
              }
              className="w-full cursor-pointer rounded-xl border border-[var(--color-deep)]/12 bg-[var(--color-cream)] px-3 py-2.5 outline-none"
            >
              {GOAL_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {GOAL_CATEGORY_ICONS[c]} {c}
                </option>
              ))}
            </select>
          </label>

          {(livePace.remaining > 0 || draft.targetDate) && (
            <div className="rounded-2xl bg-[var(--color-mist)]/50 p-3 text-sm text-[var(--color-deep)]">
              <p className="font-semibold">
                {formatPeso(livePace.remaining)} remaining
              </p>
              {livePace.perDay !== null && livePace.perWeek !== null ? (
                <p className="mt-1 text-[var(--color-deep)]/70">
                  You need to save about{" "}
                  <strong>{formatPeso(livePace.perDay)}/day</strong> or{" "}
                  <strong>{formatPeso(livePace.perWeek)}/week</strong>
                  {livePace.daysLeft !== null
                    ? ` (${livePace.daysLeft} days left)`
                    : ""}
                  .
                </p>
              ) : (
                <p className="mt-1 text-[var(--color-deep)]/70">
                  Add a target date to see a suggested daily/weekly pace.
                </p>
              )}
            </div>
          )}

          <button
            type="submit"
            className="btn-save w-full cursor-pointer rounded-2xl py-3 font-semibold text-white"
          >
            {editingGoal ? "Save changes" : "Create goal"}
          </button>
        </form>
      </Modal>

      <AddSavingsModal
        open={savingsOpen}
        onClose={() => {
          setSavingsOpen(false);
          setActiveGoalId(undefined);
        }}
        goals={state.goals}
        preferredGoalId={activeGoalId}
        onSubmit={addSavings}
      />
    </div>
  );
}

function GoalCard({
  goal,
  onAdd,
  onEdit,
  onDelete,
}: {
  goal: Goal;
  onAdd: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const pct = Math.min(
    100,
    Math.round((goal.currentSaved / goal.targetAmount) * 100) || 0
  );
  const pace = savingsPace(goal);
  const milestones = goalMilestones(goal);
  const icon =
    goal.icon ||
    (goal.category ? GOAL_CATEGORY_ICONS[goal.category] : "🎯");

  return (
    <Surface className="fade-up p-5">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="font-semibold text-[var(--color-deep)]">
            {icon} {goal.name}
          </p>
          {goal.category && (
            <p className="mt-0.5 text-xs text-[var(--color-deep)]/50">
              {goal.category}
            </p>
          )}
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={onEdit}
            className="cursor-pointer text-xs font-semibold text-[var(--color-deep)]/60"
          >
            Edit
          </button>
          <button
            type="button"
            onClick={onDelete}
            className="cursor-pointer text-xs font-semibold text-red-700"
          >
            Delete
          </button>
        </div>
      </div>

      <div className="mt-4 flex items-center gap-4">
        <RingProgress percent={pct} size={88} stroke={9} label={`${pct}%`} />
        <div className="min-w-0 flex-1">
          <p className="text-sm text-[var(--color-deep)]">
            {formatPeso(goal.currentSaved)} / {formatPeso(goal.targetAmount)}
          </p>
          <div className="progress-shine mt-2 h-2 overflow-hidden rounded-full bg-[var(--color-mist)]">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[var(--color-deep)] to-[var(--color-soft)]"
              style={{ width: `${pct}%` }}
            />
          </div>
          <p className="mt-2 text-xs font-medium text-[var(--color-soft)]">
            {formatPeso(goalRemaining(goal))} remaining
          </p>
          {goal.targetDate && (
            <p className="mt-1 text-xs text-[var(--color-deep)]/50">
              Target: {formatLongDate(goal.targetDate)}
            </p>
          )}
          {pace.perWeek !== null && (
            <p className="mt-1 text-xs text-[var(--color-deep)]/65">
              Suggested: {formatPeso(pace.perWeek)} / week
              {pace.perDay !== null ? ` (~${formatPeso(pace.perDay)}/day)` : ""}
            </p>
          )}
        </div>
      </div>

      <div className="mt-4 rounded-2xl bg-[var(--color-mist)]/40 p-3">
        <p className="text-[10px] font-bold uppercase tracking-wide text-[var(--color-deep)]/45">
          Milestones
        </p>
        <ul className="mt-2 space-y-1">
          {milestones.map((m) => (
            <li
              key={m.id}
              className={`text-xs ${
                m.done
                  ? "text-[var(--color-deep)]"
                  : "text-[var(--color-deep)]/40"
              }`}
            >
              {m.done ? "✓" : "○"} {m.label}
            </li>
          ))}
        </ul>
      </div>

      <button
        type="button"
        onClick={onAdd}
        className="btn-save mt-4 w-full cursor-pointer rounded-2xl py-2.5 text-sm font-semibold text-white"
      >
        Add Savings
      </button>
    </Surface>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  inputMode,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  inputMode?: boolean;
}) {
  return (
    <label className="block text-sm">
      <span className="mb-1 block text-[var(--color-deep)]/70">{label}</span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        inputMode={inputMode ? "decimal" : undefined}
        className="w-full rounded-xl border border-[var(--color-deep)]/12 bg-[var(--color-cream)] px-3 py-2.5 outline-none"
      />
    </label>
  );
}
