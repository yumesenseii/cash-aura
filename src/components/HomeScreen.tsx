"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AddExpenseModal } from "@/components/AddExpenseModal";
import { AddSavingsModal } from "@/components/AddSavingsModal";
import { CashTimeline } from "@/components/CashTimeline";
import { DailyCashCheck } from "@/components/DailyCashCheck";
import { StartingCashModal } from "@/components/StartingCashModal";
import { Modal } from "@/components/Modal";
import { RingProgress } from "@/components/ui/RingProgress";
import { Surface } from "@/components/ui/Surface";
import { useCashora } from "@/context/CashoraContext";
import { COPY, HOME_TIPS } from "@/lib/content";
import {
  formatPeso,
  goalRemaining,
  greetingForNow,
  isEveningForCheck,
  progressCopy,
  progressPercent,
  tipForToday,
} from "@/lib/utils";

export function HomeScreen() {
  const router = useRouter();
  const { ready, state, today, addExpense, addSavings, setStartingCash } =
    useCashora();
  const [expenseOpen, setExpenseOpen] = useState(false);
  const [savingsOpen, setSavingsOpen] = useState(false);
  const [startingOpen, setStartingOpen] = useState(false);
  const [savingsFirstOpen, setSavingsFirstOpen] = useState(false);
  const [checkDismissed, setCheckDismissed] = useState(false);

  useEffect(() => {
    if (!ready) return;
    if (!state.prefs.onboardingComplete) {
      router.replace("/app/onboarding");
    }
  }, [ready, state.prefs.onboardingComplete, router]);

  if (!ready) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-[var(--color-deep)]/50">
        Loading…
      </div>
    );
  }

  const percent = progressPercent(today.starting, today.spent, today.saved);
  const showCheck =
    state.prefs.dailyCheckEnabled &&
    today.hasDay &&
    isEveningForCheck(state.prefs.dailyCheckTime) &&
    !checkDismissed;
  const activeGoal = state.goals[0];
  const goalPct = activeGoal
    ? Math.min(
        100,
        Math.round((activeGoal.currentSaved / activeGoal.targetAmount) * 100) ||
          0
      )
    : 0;
  const logCount = today.txs.filter((t) => t.type !== "starting").length;
  const tip = tipForToday(HOME_TIPS);

  function handleStartingSubmit(amount: number) {
    const wasNew = !today.hasDay;
    setStartingCash(amount);
    if (wasNew) setSavingsFirstOpen(true);
  }

  return (
    <div className="space-y-4">
      <header className="fade-up">
        <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--color-soft)]">
          Cashora
        </p>
        <h1 className="mt-1 font-[family-name:var(--font-display)] text-[1.45rem] font-semibold leading-snug text-[var(--color-deep)]">
          {greetingForNow(state.prefs.name)}
        </h1>
      </header>

      <DailyCashCheck
        open={showCheck}
        onDone={() => setCheckDismissed(true)}
        onLater={() => setCheckDismissed(true)}
        onAddExpense={() => {
          setCheckDismissed(true);
          setExpenseOpen(true);
        }}
      />

      {!today.hasDay ? (
        <Surface className="fade-up p-6 text-center">
          <div
            className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl text-2xl font-bold text-white shadow-[var(--shadow-lift)]"
            style={{ background: "var(--grad-hero)" }}
          >
            ₱
          </div>
          <p className="text-lg font-semibold text-[var(--color-deep)]">
            {COPY.emptyHomeTitle}
          </p>
          <p className="mt-2 text-sm text-[var(--color-deep)]/65">
            {COPY.emptyHomeBody}
          </p>
          <p className="mt-3 text-sm italic text-[var(--color-brown)]">
            Wait, saan napunta yung ₱500?
          </p>
          <p className="mt-4 rounded-2xl bg-[var(--color-mist)]/60 px-3 py-2 text-left text-xs leading-relaxed text-[var(--color-deep)]/70">
            {tip}
          </p>
          <button
            type="button"
            onClick={() => setStartingOpen(true)}
            className="btn-save mt-5 w-full cursor-pointer rounded-2xl py-3.5 font-semibold text-white"
          >
            {COPY.setStartingCash}
          </button>
        </Surface>
      ) : (
        <>
          <section className="surface-hero fade-up rounded-[1.75rem] p-5 text-white">
            <div className="relative z-[1] flex items-start justify-between gap-3">
              <div>
                <p className="text-sm text-white/75">{COPY.safeToSpend}</p>
                <p className="mt-1 text-4xl font-bold tracking-tight tabular-nums">
                  {formatPeso(today.safeToSpend)}
                </p>
                <p className="mt-2 max-w-[14rem] text-xs leading-relaxed text-white/65">
                  {COPY.safeToSpendHelper}
                </p>
              </div>
              <RingProgress
                percent={percent}
                size={86}
                stroke={8}
                tone="soft"
                inverted
                label={`${percent}%`}
              />
            </div>
          </section>

          <Surface className="fade-up p-4">
            <p className="text-xs font-bold uppercase tracking-wide text-[var(--color-deep)]/45">
              {COPY.todayGlance}
            </p>
            <p className="mt-1 text-sm leading-relaxed text-[var(--color-deep)]">
              Spent {formatPeso(today.spent)} · Saved {formatPeso(today.saved)} ·{" "}
              {logCount} {logCount === 1 ? "log" : "logs"} today
            </p>
          </Surface>

          <section className="fade-up grid grid-cols-3 gap-2.5">
            {[
              {
                label: COPY.startingCash,
                value: today.starting,
                tint: "from-[#e8eef2]/80 to-white/40",
              },
              {
                label: COPY.spent,
                value: today.spent,
                tint: "from-[#f0e6dc]/90 to-white/40",
              },
              {
                label: COPY.saved,
                value: today.saved,
                tint: "from-[#dfeaf0]/90 to-white/40",
              },
            ].map((stat) => (
              <div
                key={stat.label}
                className={`stat-chip rounded-2xl bg-gradient-to-br ${stat.tint} px-2 py-3 text-center`}
              >
                <p className="text-[10px] font-semibold uppercase tracking-wide text-[var(--color-deep)]/50">
                  {stat.label}
                </p>
                <p className="mt-1 text-sm font-bold tabular-nums text-[var(--color-deep)]">
                  {formatPeso(stat.value)}
                </p>
              </div>
            ))}
          </section>

          <Surface className="fade-up p-4">
            <div className="mb-2 flex items-center justify-between gap-2">
              <p className="text-sm font-semibold text-[var(--color-deep)]">
                {COPY.progressLabel}
              </p>
              <p className="text-sm font-bold tabular-nums text-[var(--color-deep)]">
                {percent}%
              </p>
            </div>
            <div className="progress-shine h-3 overflow-hidden rounded-full bg-[var(--color-mist)]">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[var(--color-deep)] to-[var(--color-soft)] transition-all duration-500"
                style={{ width: `${Math.min(percent, 100)}%` }}
              />
            </div>
            <p className="mt-2 text-sm text-[var(--color-deep)]/65">
              {progressCopy(percent)}
            </p>
          </Surface>

          <section className="fade-up grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setExpenseOpen(true)}
              className="btn-expense cursor-pointer rounded-2xl py-4 text-sm font-semibold text-white"
            >
              {COPY.addExpense}
            </button>
            <button
              type="button"
              onClick={() => setSavingsOpen(true)}
              className="btn-save cursor-pointer rounded-2xl py-4 text-sm font-semibold text-white"
            >
              {COPY.addSavings}
            </button>
          </section>

          <Surface className="fade-up p-4">
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm font-semibold text-[var(--color-deep)]">
                {COPY.activeGoal}
              </p>
              <Link
                href="/app/goals"
                className="cursor-pointer text-xs font-semibold text-[var(--color-deep)]/60 underline-offset-2 hover:underline"
              >
                See all
              </Link>
            </div>
            {activeGoal ? (
              <div className="mt-3 flex items-center gap-3">
                <RingProgress
                  percent={goalPct}
                  size={64}
                  stroke={7}
                  label={`${goalPct}%`}
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold text-[var(--color-deep)]">
                    {activeGoal.name}
                  </p>
                  <p className="mt-0.5 text-sm text-[var(--color-deep)]/60">
                    {formatPeso(activeGoal.currentSaved)} of{" "}
                    {formatPeso(activeGoal.targetAmount)}
                  </p>
                  <p className="mt-1 text-xs text-[var(--color-deep)]/50">
                    {formatPeso(goalRemaining(activeGoal))} {COPY.remaining}
                  </p>
                </div>
              </div>
            ) : (
              <div className="mt-2">
                <p className="text-sm text-[var(--color-deep)]/65">
                  {COPY.noActiveGoal}
                </p>
                <Link
                  href="/app/goals"
                  className="btn-save mt-3 inline-flex cursor-pointer rounded-xl px-4 py-2 text-sm font-semibold text-white"
                >
                  {COPY.createGoal}
                </Link>
              </div>
            )}
          </Surface>

          <Surface className="fade-up p-4">
            <p className="text-sm leading-relaxed text-[var(--color-deep)]/75">
              {tip}
            </p>
          </Surface>

          <Surface className="fade-up p-5">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-semibold text-[var(--color-deep)]">
                {COPY.timelineTitle}
              </h2>
              <button
                type="button"
                onClick={() => setStartingOpen(true)}
                className="cursor-pointer rounded-xl bg-[var(--color-mist)] px-2.5 py-1 text-xs font-semibold text-[var(--color-deep)] transition hover:bg-[var(--color-soft)]/30"
              >
                Edit start
              </button>
            </div>
            <CashTimeline
              transactions={today.txs}
              currentCash={today.currentCash}
            />
          </Surface>
        </>
      )}

      <AddExpenseModal
        open={expenseOpen}
        onClose={() => setExpenseOpen(false)}
        onSubmit={addExpense}
      />
      <AddSavingsModal
        open={savingsOpen}
        onClose={() => setSavingsOpen(false)}
        goals={state.goals}
        onSubmit={addSavings}
      />
      <StartingCashModal
        open={startingOpen}
        onClose={() => setStartingOpen(false)}
        onSubmit={handleStartingSubmit}
        initialAmount={
          today.hasDay
            ? today.starting
            : state.prefs.defaultStartingCash || 500
        }
      />
      <Modal
        open={savingsFirstOpen}
        title={COPY.savingsFirstTitle}
        onClose={() => setSavingsFirstOpen(false)}
      >
        <p className="mb-4 text-sm text-[var(--color-deep)]/70">
          {COPY.savingsFirstBody}
        </p>
        <div className="flex flex-col gap-2">
          <button
            type="button"
            onClick={() => {
              setSavingsFirstOpen(false);
              setSavingsOpen(true);
            }}
            className="btn-save w-full cursor-pointer rounded-2xl py-3.5 font-semibold text-white"
          >
            Yes, save first
          </button>
          <button
            type="button"
            onClick={() => setSavingsFirstOpen(false)}
            className="w-full cursor-pointer rounded-2xl bg-[var(--color-mist)] py-3 font-medium text-[var(--color-deep)] transition hover:opacity-90"
          >
            Skip for now
          </button>
        </div>
      </Modal>
    </div>
  );
}
