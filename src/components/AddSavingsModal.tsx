"use client";

import { useEffect, useState } from "react";
import type { Goal } from "@/lib/types";
import { Modal } from "./Modal";

type Props = {
  open: boolean;
  onClose: () => void;
  goals: Goal[];
  preferredGoalId?: string;
  onSubmit: (input: { amount: number; note?: string; goalId?: string }) => void;
};

export function AddSavingsModal({
  open,
  onClose,
  goals,
  preferredGoalId,
  onSubmit,
}: Props) {
  const [amount, setAmount] = useState("");
  const [goalId, setGoalId] = useState("");
  const [note, setNote] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;
    setGoalId(preferredGoalId || goals[0]?.id || "");
  }, [open, preferredGoalId, goals]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const value = Number(amount);
    if (!value || value <= 0) {
      setError("Enter an amount.");
      return;
    }
    onSubmit({
      amount: value,
      note: note.trim() || undefined,
      goalId: goalId || undefined,
    });
    setAmount("");
    setNote("");
    setError("");
    onClose();
  }

  return (
    <Modal open={open} title="Add savings" onClose={onClose}>
      <p className="mb-4 text-sm text-[var(--color-deep)]/70">
        Set aside money early — future you will thank you.
      </p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <label className="block">
          <span className="mb-1 block text-sm text-[var(--color-deep)]/70">
            Amount (₱)
          </span>
          <input
            inputMode="decimal"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="e.g. 100"
            className="w-full rounded-2xl border border-[var(--color-deep)]/15 bg-[var(--color-cream)] px-4 py-3 text-2xl font-semibold text-[var(--color-deep)] outline-none focus:border-[var(--color-soft)]"
          />
        </label>
        {goals.length > 0 && (
          <label className="block">
            <span className="mb-1 block text-sm text-[var(--color-deep)]/70">
              Toward goal
            </span>
            <select
              value={goalId}
              onChange={(e) => setGoalId(e.target.value)}
              className="w-full cursor-pointer rounded-2xl border border-[var(--color-deep)]/15 bg-[var(--color-cream)] px-4 py-3 text-[var(--color-deep)] outline-none"
            >
              {goals.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.name}
                </option>
              ))}
            </select>
          </label>
        )}
        <label className="block">
          <span className="mb-1 block text-sm text-[var(--color-deep)]/70">
            Note (optional)
          </span>
          <input
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Savings First"
            className="w-full rounded-2xl border border-[var(--color-deep)]/15 bg-[var(--color-cream)] px-4 py-3 text-[var(--color-deep)] outline-none"
          />
        </label>
        {error && <p className="text-sm text-red-700">{error}</p>}
        <button
          type="submit"
          className="btn-save w-full cursor-pointer rounded-2xl py-3.5 text-base font-semibold text-white"
        >
          Save this amount
        </button>
      </form>
    </Modal>
  );
}
