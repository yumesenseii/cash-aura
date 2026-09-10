"use client";

type Props = {
  open: boolean;
  onDone: () => void;
  onAddExpense: () => void;
  onLater: () => void;
};

export function DailyCashCheck({ open, onDone, onAddExpense, onLater }: Props) {
  if (!open) return null;

  return (
    <div className="surface-card fade-up mb-4 rounded-[1.4rem] border border-[var(--color-soft)]/35 p-4">
      <div className="flex items-start gap-3">
        <span
          className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-sm font-bold text-white"
          style={{ background: "var(--grad-hero)" }}
        >
          ✓
        </span>
        <div>
          <p className="text-sm font-semibold text-[var(--color-deep)]">
            Daily Cash Check
          </p>
          <p className="mt-1 text-sm text-[var(--color-deep)]/70">
            Did you log everything today? Quick check before you forget.
          </p>
        </div>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={onDone}
          className="btn-save cursor-pointer rounded-xl px-3 py-2 text-sm font-medium text-white"
        >
          I&apos;m done
        </button>
        <button
          type="button"
          onClick={onAddExpense}
          className="btn-expense cursor-pointer rounded-xl px-3 py-2 text-sm font-medium text-white"
        >
          Add missing expense
        </button>
        <button
          type="button"
          onClick={onLater}
          className="cursor-pointer rounded-xl bg-[var(--color-mist)] px-3 py-2 text-sm font-medium text-[var(--color-deep)] transition hover:opacity-80"
        >
          Remind me later
        </button>
      </div>
    </div>
  );
}
