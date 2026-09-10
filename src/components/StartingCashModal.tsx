"use client";

import { useState } from "react";
import { Modal } from "./Modal";

type Props = {
  open: boolean;
  onClose: () => void;
  onSubmit: (amount: number) => void;
  initialAmount?: number;
  title?: string;
  helper?: string;
};

export function StartingCashModal({
  open,
  onClose,
  onSubmit,
  initialAmount = 500,
  title = "Starting cash",
  helper = "How much cash do you have with you right now?",
}: Props) {
  const [amount, setAmount] = useState(String(initialAmount || ""));
  const [error, setError] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const value = Number(amount);
    if (!value || value <= 0) {
      setError("Enter your starting cash.");
      return;
    }
    onSubmit(value);
    setError("");
    onClose();
  }

  return (
    <Modal open={open} title={title} onClose={onClose}>
      <p className="mb-4 text-sm text-[var(--color-deep)]/70">{helper}</p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <label className="block">
          <span className="mb-1 block text-sm text-[var(--color-deep)]/70">
            Amount (₱)
          </span>
          <input
            inputMode="decimal"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="e.g. 500"
            className="w-full rounded-2xl border border-[var(--color-deep)]/15 bg-[var(--color-cream)] px-4 py-3 text-2xl font-semibold text-[var(--color-deep)] outline-none focus:border-[var(--color-soft)]"
          />
        </label>
        {error && <p className="text-sm text-red-700">{error}</p>}
        <button
          type="submit"
          className="btn-save w-full cursor-pointer rounded-2xl py-3.5 text-base font-semibold text-white"
        >
          Start today
        </button>
      </form>
    </Modal>
  );
}
