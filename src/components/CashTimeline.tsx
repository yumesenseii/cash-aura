"use client";

import type { Transaction } from "@/lib/types";
import { formatPeso, formatTime } from "@/lib/utils";

type Props = {
  transactions: Transaction[];
  currentCash: number;
};

export function CashTimeline({ transactions, currentCash }: Props) {
  const events = [...transactions].sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );

  if (events.length === 0) {
    return (
      <p className="text-sm text-[var(--color-deep)]/55">
        Your timeline will appear as you log cash.
      </p>
    );
  }

  const rows = [
    ...events.map((tx) => ({ kind: "tx" as const, tx })),
    { kind: "current" as const },
  ];

  return (
    <ol className="relative space-y-0">
      {rows.map((row, index) => {
        const isLast = index === rows.length - 1;
        if (row.kind === "current") {
          return (
            <li key="current" className="relative flex gap-3 pb-0">
              {!isLast && (
                <span className="absolute left-[9px] top-5 h-[calc(100%-8px)] w-px bg-[var(--color-soft)]/40" />
              )}
              <span className="relative z-[1] mt-1 flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full bg-[var(--color-deep)] shadow-[0_0_0_4px_rgba(41,76,96,0.12)]">
                <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-off)]" />
              </span>
              <div className="flex min-w-0 flex-1 items-baseline justify-between gap-2 rounded-2xl bg-[var(--color-mist)]/50 px-3 py-2">
                <p className="font-semibold text-[var(--color-deep)]">
                  Current cash
                </p>
                <p className="font-bold tabular-nums text-[var(--color-deep)]">
                  {formatPeso(currentCash)}
                </p>
              </div>
            </li>
          );
        }

        const tx = row.tx;
        const isExpense = tx.type === "expense";
        const isSavings = tx.type === "savings";
        const label =
          tx.type === "starting"
            ? "Starting cash"
            : tx.note || tx.category || (isSavings ? "Savings" : "Expense");
        const amountText =
          tx.type === "starting"
            ? formatPeso(tx.amount)
            : isExpense
              ? `−${formatPeso(tx.amount)}`
              : `+${formatPeso(tx.amount)}`;
        const dot =
          isExpense
            ? "bg-[var(--color-brown)] shadow-[0_0_0_4px_rgba(139,98,72,0.15)]"
            : isSavings
              ? "bg-[var(--color-soft)] shadow-[0_0_0_4px_rgba(143,175,192,0.25)]"
              : "bg-[var(--color-deep)] shadow-[0_0_0_4px_rgba(41,76,96,0.12)]";

        return (
          <li key={tx.id} className="relative flex gap-3 pb-4">
            <span className="absolute left-[9px] top-5 h-[calc(100%-8px)] w-px bg-[var(--color-soft)]/40" />
            <span
              className={`relative z-[1] mt-1 h-[18px] w-[18px] shrink-0 rounded-full ${dot}`}
            />
            <div className="min-w-0 flex-1">
              <div className="flex items-baseline justify-between gap-2">
                <p className="truncate font-medium text-[var(--color-deep)]">
                  {label}
                </p>
                <p
                  className={`shrink-0 font-semibold tabular-nums ${
                    isExpense
                      ? "text-[var(--color-brown)]"
                      : "text-[var(--color-deep)]"
                  }`}
                >
                  {amountText}
                </p>
              </div>
              <p className="text-xs text-[var(--color-deep)]/48">
                {formatTime(tx.timestamp)}
              </p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
