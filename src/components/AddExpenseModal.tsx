"use client";

import { useState } from "react";
import { EXPENSE_CATEGORIES, type ExpenseCategory } from "@/lib/types";
import { Modal } from "./Modal";

type Props = {
  open: boolean;
  onClose: () => void;
  onSubmit: (input: {
    amount: number;
    category: ExpenseCategory;
    note?: string;
  }) => void;
};

export function AddExpenseModal({ open, onClose, onSubmit }: Props) {
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState<ExpenseCategory>("Snack");
  const [note, setNote] = useState("");
  const [error, setError] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const value = Number(amount);
    if (!value || value <= 0) {
      setError("Enter an amount.");
      return;
    }
    onSubmit({ amount: value, category, note: note.trim() || undefined });
    setAmount("");
    setNote("");
    setError("");
    onClose();
  }

  return (
    <Modal open={open} title="Add expense" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <label className="block">
          <span className="mb-1 block text-sm text-[var(--color-deep)]/70">
            Amount (₱)
          </span>
          <input
            inputMode="decimal"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="e.g. 50"
            className="w-full rounded-2xl border border-[var(--color-deep)]/15 bg-[var(--color-cream)] px-4 py-3 text-2xl font-semibold text-[var(--color-deep)] outline-none focus:border-[var(--color-brown)]"
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-sm text-[var(--color-deep)]/70">
            Category
          </span>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as ExpenseCategory)}
            className="w-full cursor-pointer rounded-2xl border border-[var(--color-deep)]/15 bg-[var(--color-cream)] px-4 py-3 text-[var(--color-deep)] outline-none"
          >
            {EXPENSE_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="mb-1 block text-sm text-[var(--color-deep)]/70">
            Note (optional)
          </span>
          <input
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="What was it?"
            className="w-full rounded-2xl border border-[var(--color-deep)]/15 bg-[var(--color-cream)] px-4 py-3 text-[var(--color-deep)] outline-none"
          />
        </label>
        {error && <p className="text-sm text-red-700">{error}</p>}
        <button
          type="submit"
          className="btn-expense w-full cursor-pointer rounded-2xl py-3.5 text-base font-semibold text-white"
        >
          Save expense
        </button>
      </form>
    </Modal>
  );
}
