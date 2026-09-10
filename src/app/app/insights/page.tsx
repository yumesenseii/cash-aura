"use client";

import { useMemo } from "react";
import { AreaSpark } from "@/components/ui/AreaSpark";
import { PageHeader, Surface } from "@/components/ui/Surface";
import { RingProgress } from "@/components/ui/RingProgress";
import { useCashora } from "@/context/CashoraContext";
import { COPY } from "@/lib/content";
import {
  buildInsightNarrative,
  formatDayLabel,
  formatPeso,
  rangeTotals,
  todayId,
} from "@/lib/utils";

export default function InsightsPage() {
  const { state } = useCashora();

  const insights = useMemo(() => {
    const now = new Date();
    const weekPoints: {
      label: string;
      dayId: string;
      value: number;
      spent: number;
      saved: number;
    }[] = [];

    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(now.getDate() - i);
      const id = todayId(d);
      const dayTx = state.transactions.filter((t) => t.dayId === id);
      const spent = dayTx
        .filter((t) => t.type === "expense")
        .reduce((s, t) => s + t.amount, 0);
      const saved = dayTx
        .filter((t) => t.type === "savings")
        .reduce((s, t) => s + t.amount, 0);
      weekPoints.push({
        label: d.toLocaleDateString("en-PH", { weekday: "short" }),
        dayId: id,
        value: spent + saved,
        spent,
        saved,
      });
    }

    const spent = weekPoints.reduce((s, p) => s + p.spent, 0);
    const saved = weekPoints.reduce((s, p) => s + p.saved, 0);
    const total = spent + saved;
    const savedShare = total > 0 ? Math.round((saved / total) * 100) : 0;

    const weekStart = weekPoints[0]?.dayId ?? todayId();
    const weekEnd = weekPoints[weekPoints.length - 1]?.dayId ?? todayId();

    const prevEnd = (() => {
      const d = new Date(`${weekStart}T12:00:00`);
      d.setDate(d.getDate() - 1);
      return todayId(d);
    })();
    const prevStart = (() => {
      const d = new Date(`${prevEnd}T12:00:00`);
      d.setDate(d.getDate() - 6);
      return todayId(d);
    })();
    const prevWeek = rangeTotals(prevStart, prevEnd, state.transactions);
    const weekSpentDelta = spent - prevWeek.spent;

    const categoryMap = new Map<string, number>();
    state.transactions
      .filter((t) => t.type === "expense" && t.dayId >= weekStart)
      .forEach((t) => {
        const key = String(t.category || "Others");
        categoryMap.set(key, (categoryMap.get(key) || 0) + t.amount);
      });

    const topCategories = [...categoryMap.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4);

    const bestSave = [...weekPoints].sort((a, b) => b.saved - a.saved)[0];
    const worstSpend = [...weekPoints].sort((a, b) => b.spent - a.spent)[0];
    const daysWithSpend = weekPoints.filter((p) => p.spent > 0).length || 1;
    const avgDailySpend = spent / Math.max(daysWithSpend, 1);

    const daySet = new Set(state.days.map((d) => d.date));
    let streak = 0;
    const cursor = new Date();
    for (;;) {
      const id = todayId(cursor);
      if (daySet.has(id)) {
        streak += 1;
        cursor.setDate(cursor.getDate() - 1);
      } else break;
    }

    const narrative = buildInsightNarrative({
      spent,
      saved,
      topCategory: topCategories[0]?.[0],
      topAmount: topCategories[0]?.[1],
      bestSaveDay: bestSave?.saved
        ? formatDayLabel(bestSave.dayId)
        : undefined,
      bestSaveAmount: bestSave?.saved,
      avgDailySpend,
      weekSpentDelta:
        prevWeek.spent > 0 || spent > 0 ? weekSpentDelta : undefined,
    });

    return {
      spent,
      saved,
      savedShare,
      topCategories,
      streak,
      weekPoints,
      narrative,
      bestSave,
      worstSpend,
      avgDailySpend,
      weekSpentDelta,
      weekEnd,
      prevWeek,
    };
  }, [state.days, state.transactions]);

  const maxCat = Math.max(...insights.topCategories.map(([, a]) => a), 1);

  return (
    <div className="space-y-4">
      <PageHeader
        title="Insights"
        subtitle={COPY.insightsIntro}
        eyebrow="This week"
      />

      <Surface className="fade-up p-5">
        <p className="text-xs font-bold uppercase tracking-wide text-[var(--color-deep)]/45">
          Story of your week
        </p>
        <p className="mt-2 text-sm leading-relaxed text-[var(--color-deep)]/85">
          {insights.narrative}
        </p>
      </Surface>

      <Surface className="fade-up overflow-hidden p-5">
        <div className="mb-2 flex items-end justify-between">
          <div>
            <p className="text-sm font-semibold text-[var(--color-deep)]">
              Weekly activity
            </p>
            <p className="text-xs text-[var(--color-deep)]/50">
              Spend + save over 7 days
            </p>
          </div>
          <p className="text-sm font-bold tabular-nums text-[var(--color-deep)]">
            {formatPeso(insights.spent + insights.saved)}
          </p>
        </div>
        <AreaSpark
          points={insights.weekPoints.map(({ label, value }) => ({
            label,
            value,
          }))}
          color="#8fafc0"
        />
        <div className="mt-1 flex justify-between text-[10px] text-[var(--color-deep)]/40">
          {insights.weekPoints.map((p) => (
            <span key={p.dayId}>{p.label.slice(0, 2)}</span>
          ))}
        </div>
      </Surface>

      <section className="grid grid-cols-2 gap-3">
        <Surface className="fade-up p-4">
          <p className="text-xs font-medium text-[var(--color-deep)]/55">
            This week spent
          </p>
          <p className="mt-2 text-xl font-bold tabular-nums text-[var(--color-brown)]">
            {formatPeso(insights.spent)}
          </p>
          {insights.weekSpentDelta !== 0 && (
            <p className="mt-1 text-[11px] text-[var(--color-deep)]/50">
              {insights.weekSpentDelta < 0 ? "↓" : "↑"}{" "}
              {formatPeso(Math.abs(insights.weekSpentDelta))} vs last week
            </p>
          )}
        </Surface>
        <Surface className="fade-up p-4">
          <p className="text-xs font-medium text-[var(--color-deep)]/55">
            This week saved
          </p>
          <p className="mt-2 text-xl font-bold tabular-nums text-[var(--color-deep)]">
            {formatPeso(insights.saved)}
          </p>
          <p className="mt-1 text-[11px] text-[var(--color-deep)]/50">
            Last week {formatPeso(insights.prevWeek.saved)}
          </p>
        </Surface>
      </section>

      <section className="grid grid-cols-2 gap-3">
        <Surface className="fade-up p-4">
          <p className="text-xs font-medium text-[var(--color-deep)]/55">
            Avg daily spend
          </p>
          <p className="mt-2 text-lg font-bold tabular-nums text-[var(--color-deep)]">
            {formatPeso(Math.round(insights.avgDailySpend))}
          </p>
        </Surface>
        <Surface className="fade-up p-4">
          <p className="text-xs font-medium text-[var(--color-deep)]/55">
            Highest spend day
          </p>
          <p className="mt-2 text-sm font-semibold text-[var(--color-deep)]">
            {insights.worstSpend?.spent
              ? formatDayLabel(insights.worstSpend.dayId)
              : "—"}
          </p>
          <p className="text-xs tabular-nums text-[var(--color-brown)]">
            {insights.worstSpend?.spent
              ? formatPeso(insights.worstSpend.spent)
              : "No spends yet"}
          </p>
        </Surface>
      </section>

      <Surface className="fade-up flex items-center gap-4 p-5">
        <RingProgress
          percent={insights.savedShare}
          size={100}
          stroke={10}
          tone="soft"
          label={`${insights.savedShare}%`}
          sublabel="saved"
        />
        <div>
          <p className="font-semibold text-[var(--color-deep)]">Save ratio</p>
          <p className="mt-1 text-sm text-[var(--color-deep)]/60">
            Of this week&apos;s logged cash flow
          </p>
          <p className="mt-3 text-2xl font-bold text-[var(--color-deep)]">
            {insights.streak}
            <span className="ml-1 text-sm font-medium text-[var(--color-deep)]/50">
              day streak
            </span>
          </p>
          {insights.bestSave?.saved ? (
            <p className="mt-1 text-xs text-[var(--color-deep)]/55">
              Best save: {formatDayLabel(insights.bestSave.dayId)} (
              {formatPeso(insights.bestSave.saved)})
            </p>
          ) : null}
        </div>
      </Surface>

      <Surface className="fade-up p-5">
        <p className="font-semibold text-[var(--color-deep)]">Top categories</p>
        {insights.topCategories.length === 0 ? (
          <p className="mt-3 text-sm text-[var(--color-deep)]/55">
            Log a few expenses to see where cash goes — snacks and jeepney often
            surprise people.
          </p>
        ) : (
          <ul className="mt-4 space-y-3">
            {insights.topCategories.map(([cat, amount]) => (
              <li key={cat}>
                <div className="mb-1 flex items-center justify-between text-sm">
                  <span className="text-[var(--color-deep)]">{cat}</span>
                  <span className="font-semibold tabular-nums text-[var(--color-deep)]">
                    {formatPeso(amount)}
                  </span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-[var(--color-mist)]">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-[var(--color-brown)] to-[#c4a28a]"
                    style={{ width: `${(amount / maxCat) * 100}%` }}
                  />
                </div>
              </li>
            ))}
          </ul>
        )}
      </Surface>

      <Surface className="fade-up p-4">
        <p className="text-sm leading-relaxed text-[var(--color-deep)]/70">
          Habit tip: if one category keeps leading, set a soft daily cap in your
          head — then watch Safe to Spend before you spend again.
        </p>
      </Surface>
    </div>
  );
}
