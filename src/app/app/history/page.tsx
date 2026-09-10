"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import Link from "next/link";
import { Modal } from "@/components/Modal";
import { PageHeader, Surface } from "@/components/ui/Surface";
import { useCashora } from "@/context/CashoraContext";
import { COPY } from "@/lib/content";
import {
  EXPENSE_CATEGORIES,
  HISTORY_BUCKETS,
  type HistoryBucket,
  type Transaction,
} from "@/lib/types";
import {
  dayTotals,
  formatDayLabel,
  formatLongDate,
  formatPeso,
  formatTime,
  mapToHistoryBucket,
  monthStartId,
  todayId,
  txDescription,
  txIcon,
} from "@/lib/utils";

type DateFilter = "all" | "today" | "week" | "month";
type TypeFilter = "all" | "expense" | "savings" | "income";

function SegmentedControl<T extends string>({
  value,
  options,
  onChange,
}: {
  value: T;
  options: { id: T; label: string }[];
  onChange: (id: T) => void;
}) {
  return (
    <div
      role="tablist"
      className="grid gap-0.5 rounded-xl border border-[var(--color-deep)]/10 bg-[var(--color-mist)]/55 p-0.5"
      style={{ gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))` }}
    >
      {options.map((opt) => {
        const active = value === opt.id;
        return (
          <button
            key={opt.id}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(opt.id)}
            className={`cursor-pointer rounded-lg px-1.5 py-2 text-center text-[11px] font-semibold transition-colors duration-150 ${
              active
                ? "bg-[var(--color-deep)] text-white shadow-sm"
                : "text-[var(--color-deep)]/55 hover:text-[var(--color-deep)]"
            }`}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

function FilterLabel({ children }: { children: ReactNode }) {
  return (
    <p className="mb-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--color-deep)]/45">
      {children}
    </p>
  );
}

export default function HistoryPage() {
  const { state, updateTransaction, deleteTransaction } = useCashora();
  const [dateFilter, setDateFilter] = useState<DateFilter>("all");
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("all");
  const [bucket, setBucket] = useState<HistoryBucket>("All");
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);

  const rangeIds = useMemo(() => {
    const today = todayId();
    if (dateFilter === "today") return { start: today, end: today };
    if (dateFilter === "week") {
      const d = new Date();
      d.setDate(d.getDate() - 6);
      return { start: todayId(d), end: today };
    }
    if (dateFilter === "month") {
      return { start: monthStartId(), end: today };
    }
    return { start: "0000-01-01", end: "9999-12-31" };
  }, [dateFilter]);

  const filteredTxs = useMemo(() => {
    const q = query.trim().toLowerCase();
    return state.transactions
      .filter((t) => t.dayId >= rangeIds.start && t.dayId <= rangeIds.end)
      .filter((t) => {
        if (typeFilter === "all") return true;
        if (typeFilter === "income") return t.type === "starting";
        if (typeFilter === "expense") return t.type === "expense";
        return t.type === "savings";
      })
      .filter((t) => {
        if (bucket === "All") return true;
        return mapToHistoryBucket(t) === bucket;
      })
      .filter((t) => {
        if (!q) return true;
        const hay = [
          txDescription(t),
          String(t.category || ""),
          String(t.note || ""),
          String(t.amount),
          mapToHistoryBucket(t),
        ]
          .join(" ")
          .toLowerCase();
        return hay.includes(q);
      })
      .sort(
        (a, b) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );
  }, [state.transactions, rangeIds, typeFilter, bucket, query]);

  const grouped = useMemo(() => {
    const map = new Map<string, Transaction[]>();
    filteredTxs.forEach((t) => {
      const list = map.get(t.dayId) || [];
      list.push(t);
      map.set(t.dayId, list);
    });
    return [...map.entries()].sort((a, b) => b[0].localeCompare(a[0]));
  }, [filteredTxs]);

  const summary = useMemo(() => {
    const monthStart = monthStartId();
    const today = todayId();
    const monthTx = state.transactions.filter(
      (t) => t.dayId >= monthStart && t.dayId <= today
    );
    const spent = monthTx
      .filter((t) => t.type === "expense")
      .reduce((s, t) => s + t.amount, 0);
    const saved = monthTx
      .filter((t) => t.type === "savings")
      .reduce((s, t) => s + t.amount, 0);
    const count = monthTx.filter((t) => t.type !== "starting").length;
    return { spent, saved, count };
  }, [state.transactions]);

  const breakdown = useMemo(() => {
    const expenseTx = filteredTxs.filter((t) => t.type === "expense");
    const total = expenseTx.reduce((s, t) => s + t.amount, 0);
    const map = new Map<string, number>();
    expenseTx.forEach((t) => {
      const key = mapToHistoryBucket(t);
      map.set(key, (map.get(key) || 0) + t.amount);
    });
    return [...map.entries()]
      .map(([name, amount]) => ({
        name,
        amount,
        pct: total > 0 ? Math.round((amount / total) * 100) : 0,
      }))
      .sort((a, b) => b.amount - a.amount);
  }, [filteredTxs]);

  const selected = selectedId
    ? state.transactions.find((t) => t.id === selectedId) || null
    : null;

  return (
    <div className="space-y-4">
      <PageHeader
        title="History"
        subtitle="Where did your cash go?"
        eyebrow="Cash log"
      />

      <Surface className="fade-up p-4">
        <p className="text-xs font-bold uppercase tracking-wide text-[var(--color-deep)]/45">
          This month
        </p>
        <div className="mt-3 grid grid-cols-3 gap-2 text-center">
          <div className="rounded-xl bg-[var(--color-mist)]/50 px-2 py-2">
            <p className="text-[10px] uppercase text-[var(--color-deep)]/45">
              Total spent
            </p>
            <p className="font-bold tabular-nums text-[var(--color-brown)]">
              {formatPeso(summary.spent)}
            </p>
          </div>
          <div className="rounded-xl bg-[var(--color-mist)]/50 px-2 py-2">
            <p className="text-[10px] uppercase text-[var(--color-deep)]/45">
              Total saved
            </p>
            <p className="font-bold tabular-nums text-[var(--color-deep)]">
              {formatPeso(summary.saved)}
            </p>
          </div>
          <div className="rounded-xl bg-[var(--color-mist)]/50 px-2 py-2">
            <p className="text-[10px] uppercase text-[var(--color-deep)]/45">
              Transactions
            </p>
            <p className="font-bold text-[var(--color-deep)]">{summary.count}</p>
          </div>
        </div>
      </Surface>

      <Surface className="fade-up space-y-4 p-4">
        <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--color-deep)]/45">
          Filters
        </p>

        <div>
          <FilterLabel>Period</FilterLabel>
          <SegmentedControl
            value={dateFilter}
            onChange={setDateFilter}
            options={[
              { id: "all", label: "All" },
              { id: "today", label: "Today" },
              { id: "week", label: "Week" },
              { id: "month", label: "Month" },
            ]}
          />
        </div>

        <div>
          <FilterLabel>Type</FilterLabel>
          <SegmentedControl
            value={typeFilter}
            onChange={setTypeFilter}
            options={[
              { id: "all", label: "All" },
              { id: "expense", label: "Expenses" },
              { id: "savings", label: "Savings" },
              { id: "income", label: "Income" },
            ]}
          />
        </div>

        <div>
          <FilterLabel>Search</FilterLabel>
          <div className="relative">
            <span
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-deep)]/35"
              aria-hidden
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <circle
                  cx="11"
                  cy="11"
                  r="6.5"
                  stroke="currentColor"
                  strokeWidth="1.8"
                />
                <path
                  d="M16.5 16.5 20 20"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
              </svg>
            </span>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search transactions"
              className="w-full rounded-xl border border-[var(--color-deep)]/10 bg-[var(--color-cream)]/90 py-2.5 pl-9 pr-3 text-sm text-[var(--color-deep)] outline-none transition focus:border-[var(--color-soft)]"
            />
          </div>
        </div>

        <div>
          <FilterLabel>Category</FilterLabel>
          <select
            value={bucket}
            onChange={(e) => setBucket(e.target.value as HistoryBucket)}
            className="w-full cursor-pointer rounded-xl border border-[var(--color-deep)]/10 bg-[var(--color-cream)]/90 px-3 py-2.5 text-sm font-medium text-[var(--color-deep)] outline-none transition focus:border-[var(--color-soft)]"
          >
            {HISTORY_BUCKETS.map((b) => (
              <option key={b} value={b}>
                {b === "All" ? "All categories" : b}
              </option>
            ))}
          </select>
        </div>
      </Surface>

      {breakdown.length > 0 && (
        <Surface className="fade-up p-4">
          <p className="text-sm font-semibold text-[var(--color-deep)]">
            Spending breakdown
          </p>
          <p className="mt-0.5 text-xs text-[var(--color-deep)]/50">
            Based on current filters
          </p>
          <ul className="mt-3 space-y-2.5">
            {breakdown.slice(0, 6).map((row) => (
              <li key={row.name}>
                <div className="mb-1 flex items-center justify-between text-sm">
                  <span className="text-[var(--color-deep)]">{row.name}</span>
                  <span className="tabular-nums text-[var(--color-deep)]">
                    {formatPeso(row.amount)} · {row.pct}%
                  </span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-[var(--color-mist)]">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-[var(--color-brown)] to-[#c4a28a]"
                    style={{ width: `${row.pct}%` }}
                  />
                </div>
              </li>
            ))}
          </ul>
        </Surface>
      )}

      {grouped.length === 0 ? (
        <Surface className="p-6 text-center">
          <p className="text-[var(--color-deep)]/70">{COPY.historyEmpty}</p>
          <p className="mt-2 text-sm text-[var(--color-deep)]/55">
            {COPY.historyEmptyHint}
          </p>
          <Link
            href="/app"
            className="btn-save mt-4 inline-flex cursor-pointer rounded-2xl px-5 py-2.5 text-sm font-semibold text-white"
          >
            Log cash on Home
          </Link>
        </Surface>
      ) : (
        <div className="space-y-4">
          {grouped.map(([dayId, txs]) => {
            const totals = dayTotals(dayId, state.transactions);
            const sorted = [...txs].sort(
              (a, b) =>
                new Date(a.timestamp).getTime() -
                new Date(b.timestamp).getTime()
            );
            return (
              <Surface key={dayId} className="fade-up overflow-hidden p-0">
                <div className="border-b border-[var(--color-deep)]/8 px-4 py-3">
                  <p className="font-semibold text-[var(--color-deep)]">
                    {formatDayLabel(dayId)}
                  </p>
                  <p className="text-xs text-[var(--color-deep)]/50">
                    {formatLongDate(dayId)}
                  </p>
                </div>

                <div className="space-y-1 px-2 py-2">
                  <div className="flex items-center justify-between rounded-xl px-2 py-2 text-sm">
                    <span className="font-medium text-[var(--color-deep)]">
                      Starting Cash
                    </span>
                    <span className="font-semibold tabular-nums text-[var(--color-deep)]">
                      {formatPeso(totals.starting)}
                    </span>
                  </div>

                  {sorted
                    .filter((t) => t.type !== "starting")
                    .map((tx) => (
                      <button
                        key={tx.id}
                        type="button"
                        onClick={() => {
                          setSelectedId(tx.id);
                          setEditing(false);
                        }}
                        className="flex w-full cursor-pointer items-start gap-3 rounded-xl px-2 py-2.5 text-left transition hover:bg-[var(--color-mist)]/50"
                      >
                        <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[var(--color-mist)] text-base">
                          {txIcon(tx)}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="flex items-start justify-between gap-2">
                            <span className="font-medium text-[var(--color-deep)]">
                              {txDescription(tx)}
                            </span>
                            <span
                              className={`shrink-0 font-semibold tabular-nums ${
                                tx.type === "expense"
                                  ? "text-[var(--color-brown)]"
                                  : "text-[var(--color-deep)]"
                              }`}
                            >
                              {tx.type === "expense" ? "−" : "+"}
                              {formatPeso(tx.amount)}
                            </span>
                          </span>
                          <span className="mt-0.5 block text-xs text-[var(--color-deep)]/50">
                            {formatTime(tx.timestamp)} · {mapToHistoryBucket(tx)}
                            {tx.type === "savings" ? " · Savings" : ""}
                          </span>
                        </span>
                      </button>
                    ))}

                  <div className="flex items-center justify-between rounded-xl bg-[var(--color-mist)]/40 px-2 py-2 text-sm">
                    <span className="font-semibold text-[var(--color-deep)]">
                      Ending Cash
                    </span>
                    <span className="font-bold tabular-nums text-[var(--color-deep)]">
                      {formatPeso(totals.currentCash)}
                    </span>
                  </div>
                </div>
              </Surface>
            );
          })}
        </div>
      )}

      <TransactionDetailModal
        tx={selected}
        goals={state.goals}
        editing={editing}
        onEdit={() => setEditing(true)}
        onCancelEdit={() => setEditing(false)}
        onClose={() => {
          setSelectedId(null);
          setEditing(false);
        }}
        onSave={(patch) => {
          if (!selected) return;
          updateTransaction(selected.id, patch);
          setEditing(false);
        }}
        onDelete={() => {
          if (!selected) return;
          if (window.confirm("Delete this transaction?")) {
            deleteTransaction(selected.id);
            setSelectedId(null);
            setEditing(false);
          }
        }}
      />
    </div>
  );
}

function TransactionDetailModal({
  tx,
  goals,
  editing,
  onEdit,
  onCancelEdit,
  onClose,
  onSave,
  onDelete,
}: {
  tx: Transaction | null;
  goals: { id: string; name: string }[];
  editing: boolean;
  onEdit: () => void;
  onCancelEdit: () => void;
  onClose: () => void;
  onSave: (patch: {
    amount?: number;
    category?: string;
    note?: string;
    goalId?: string | null;
  }) => void;
  onDelete: () => void;
}) {
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [note, setNote] = useState("");
  const [goalId, setGoalId] = useState("");

  useEffect(() => {
    if (!tx) return;
    setAmount(String(tx.amount));
    setCategory(String(tx.category || ""));
    setNote(tx.note || "");
    setGoalId(tx.goalId || "");
  }, [tx]);

  if (!tx) {
    return (
      <Modal open={false} title="Transaction" onClose={onClose}>
        {null}
      </Modal>
    );
  }

  return (
    <Modal
      open={Boolean(tx)}
      title={editing ? "Edit transaction" : "Transaction details"}
      onClose={onClose}
    >
      {!editing ? (
        <div className="space-y-3">
          <DetailRow label="Description" value={txDescription(tx)} />
          <DetailRow
            label="Amount"
            value={`${tx.type === "expense" ? "−" : tx.type === "savings" ? "+" : ""}${formatPeso(tx.amount)}`}
          />
          <DetailRow label="Category" value={mapToHistoryBucket(tx)} />
          <DetailRow label="Date" value={formatLongDate(tx.dayId)} />
          <DetailRow label="Time" value={formatTime(tx.timestamp)} />
          <DetailRow label="Notes" value={tx.note?.trim() || "—"} />
          <div className="flex gap-2 pt-2">
            {tx.type !== "starting" && (
              <>
                <button
                  type="button"
                  onClick={onEdit}
                  className="btn-save flex-1 cursor-pointer rounded-xl py-2.5 text-sm font-semibold text-white"
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={onDelete}
                  className="flex-1 cursor-pointer rounded-xl bg-red-700/90 py-2.5 text-sm font-semibold text-white"
                >
                  Delete
                </button>
              </>
            )}
            {tx.type === "starting" && (
              <p className="text-sm text-[var(--color-deep)]/55">
                Edit starting cash from Home → Edit start.
              </p>
            )}
          </div>
        </div>
      ) : (
        <form
          className="space-y-3"
          onSubmit={(e) => {
            e.preventDefault();
            const value = Number(amount);
            if (!value || value <= 0) return;
            onSave({
              amount: value,
              category: category || undefined,
              note: note.trim() || "",
              goalId:
                tx.type === "savings"
                  ? goalId || null
                  : undefined,
            });
          }}
        >
          <label className="block text-sm">
            <span className="mb-1 block text-[var(--color-deep)]/70">Amount</span>
            <input
              inputMode="decimal"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full rounded-xl border border-[var(--color-deep)]/12 bg-[var(--color-cream)] px-3 py-2.5 outline-none"
            />
          </label>
          {tx.type === "expense" && (
            <label className="block text-sm">
              <span className="mb-1 block text-[var(--color-deep)]/70">
                Category
              </span>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full cursor-pointer rounded-xl border border-[var(--color-deep)]/12 bg-[var(--color-cream)] px-3 py-2.5 outline-none"
              >
                {EXPENSE_CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </label>
          )}
          {tx.type === "savings" && goals.length > 0 && (
            <label className="block text-sm">
              <span className="mb-1 block text-[var(--color-deep)]/70">Goal</span>
              <select
                value={goalId}
                onChange={(e) => setGoalId(e.target.value)}
                className="w-full cursor-pointer rounded-xl border border-[var(--color-deep)]/12 bg-[var(--color-cream)] px-3 py-2.5 outline-none"
              >
                <option value="">None</option>
                {goals.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.name}
                  </option>
                ))}
              </select>
            </label>
          )}
          <label className="block text-sm">
            <span className="mb-1 block text-[var(--color-deep)]/70">Notes</span>
            <input
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full rounded-xl border border-[var(--color-deep)]/12 bg-[var(--color-cream)] px-3 py-2.5 outline-none"
            />
          </label>
          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={onCancelEdit}
              className="flex-1 cursor-pointer rounded-xl bg-[var(--color-mist)] py-2.5 text-sm font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-save flex-1 cursor-pointer rounded-xl py-2.5 text-sm font-semibold text-white"
            >
              Save
            </button>
          </div>
        </form>
      )}
    </Modal>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-3 rounded-xl bg-[var(--color-mist)]/40 px-3 py-2.5">
      <span className="text-xs font-semibold uppercase tracking-wide text-[var(--color-deep)]/45">
        {label}
      </span>
      <span className="text-right text-sm font-medium text-[var(--color-deep)]">
        {value}
      </span>
    </div>
  );
}
