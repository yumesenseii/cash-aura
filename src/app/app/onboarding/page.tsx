"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useCashora } from "@/context/CashoraContext";
import { PRODUCT } from "@/lib/content";

const STEPS = 4;

export default function OnboardingPage() {
  const router = useRouter();
  const { completeOnboarding, state, ready } = useCashora();
  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [startingCash, setStartingCash] = useState("500");
  const [goalName, setGoalName] = useState("");
  const [goalTarget, setGoalTarget] = useState("");
  const [saveFirst, setSaveFirst] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (ready && state.prefs.onboardingComplete) {
      router.replace("/app");
    }
  }, [ready, state.prefs.onboardingComplete, router]);

  function next() {
    setStep((s) => Math.min(s + 1, STEPS - 1));
  }

  function finish() {
    const start = Number(startingCash);
    if (!start || start <= 0) {
      setError("Enter your starting cash.");
      return;
    }
    const saveAmt = Number(saveFirst) || 0;
    if (saveAmt > start) {
      setError("Savings can't be more than starting cash.");
      return;
    }
    completeOnboarding({
      name,
      startingCash: start,
      goalName: goalName.trim() || undefined,
      goalTarget: Number(goalTarget) || undefined,
      saveFirstAmount: saveAmt || undefined,
    });
    router.replace("/app");
  }

  return (
    <div className="mx-auto flex min-h-[100dvh] max-w-md flex-col px-5 pb-10 pt-[max(1.5rem,env(safe-area-inset-top))]">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--color-soft)]">
        {PRODUCT.name}
      </p>

      {step === 0 && (
        <section className="mt-10 flex flex-1 flex-col">
          <h1 className="text-3xl font-bold leading-tight text-[var(--color-deep)]">
            {PRODUCT.tagline}
          </h1>
          <p className="mt-4 text-[var(--color-deep)]/70">
            Cashora helps you track baon and cash so small spends don&apos;t
            disappear.
          </p>
          <p className="mt-6 text-sm italic text-[var(--color-brown)]">
            {PRODUCT.empathyTagalog}
          </p>
          <p className="mt-auto pt-10 text-sm text-[var(--color-deep)]/55">
            {PRODUCT.sticky}
          </p>
          <button
            type="button"
            onClick={next}
            className="mt-6 w-full cursor-pointer rounded-2xl bg-[var(--color-deep)] py-3.5 font-semibold text-white transition hover:opacity-90"
          >
            Get started
          </button>
        </section>
      )}

      {step === 1 && (
        <section className="mt-10 flex flex-1 flex-col">
          <h1 className="text-2xl font-bold text-[var(--color-deep)]">
            Made for real cash days
          </h1>
          <p className="mt-3 text-[var(--color-deep)]/70">
            Students & young adults who use physical cash.
          </p>
          <ul className="mt-6 space-y-3 text-[var(--color-deep)]">
            {[
              "Daily or weekly allowances",
              "Small everyday spends",
              "Savings goals that stick",
            ].map((item) => (
              <li
                key={item}
                className="rounded-2xl bg-[var(--color-off)] px-4 py-3 shadow-sm"
              >
                {item}
              </li>
            ))}
          </ul>
          <button
            type="button"
            onClick={next}
            className="mt-auto w-full cursor-pointer rounded-2xl bg-[var(--color-deep)] py-3.5 font-semibold text-white transition hover:opacity-90"
          >
            Continue
          </button>
        </section>
      )}

      {step === 2 && (
        <section className="mt-10 flex flex-1 flex-col">
          <h1 className="text-2xl font-bold text-[var(--color-deep)]">
            How it works
          </h1>
          <ol className="mt-6 space-y-3">
            {[
              "Set starting cash",
              "Save first (optional)",
              "Log expenses as you go",
              "Watch Safe to Spend",
            ].map((item, i) => (
              <li
                key={item}
                className="flex items-center gap-3 rounded-2xl bg-[var(--color-off)] px-4 py-3 shadow-sm"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--color-cream)] text-sm font-bold text-[var(--color-deep)]">
                  {i + 1}
                </span>
                <span className="text-[var(--color-deep)]">{item}</span>
              </li>
            ))}
          </ol>
          <button
            type="button"
            onClick={next}
            className="mt-auto w-full cursor-pointer rounded-2xl bg-[var(--color-deep)] py-3.5 font-semibold text-white transition hover:opacity-90"
          >
            Set up today
          </button>
        </section>
      )}

      {step === 3 && (
        <section className="mt-8 flex flex-1 flex-col">
          <h1 className="text-2xl font-bold text-[var(--color-deep)]">
            First setup
          </h1>
          <div className="mt-5 space-y-4">
            <label className="block">
              <span className="mb-1 block text-sm text-[var(--color-deep)]/70">
                What should we call you? (optional)
              </span>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-2xl border border-[var(--color-deep)]/15 bg-[var(--color-off)] px-4 py-3 outline-none"
                placeholder="Your name"
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-sm text-[var(--color-deep)]/70">
                Starting cash today (₱)
              </span>
              <input
                inputMode="decimal"
                value={startingCash}
                onChange={(e) => setStartingCash(e.target.value)}
                className="w-full rounded-2xl border border-[var(--color-deep)]/15 bg-[var(--color-off)] px-4 py-3 text-2xl font-semibold outline-none"
                placeholder="e.g. 500"
              />
              <span className="mt-1 block text-xs text-[var(--color-deep)]/50">
                How much cash do you have with you right now?
              </span>
            </label>
            <div className="rounded-2xl border border-dashed border-[var(--color-soft)] bg-[var(--color-off)] p-4">
              <p className="text-sm font-semibold text-[var(--color-deep)]">
                Savings First (optional)
              </p>
              <p className="mt-1 text-xs text-[var(--color-deep)]/60">
                {PRODUCT.stickyAlt}
              </p>
              <input
                inputMode="decimal"
                value={saveFirst}
                onChange={(e) => setSaveFirst(e.target.value)}
                className="mt-3 w-full rounded-xl border border-[var(--color-deep)]/10 bg-[var(--color-cream)] px-3 py-2 outline-none"
                placeholder="Amount to set aside"
              />
              <input
                value={goalName}
                onChange={(e) => setGoalName(e.target.value)}
                className="mt-2 w-full rounded-xl border border-[var(--color-deep)]/10 bg-[var(--color-cream)] px-3 py-2 outline-none"
                placeholder="Goal name (e.g. New earphones)"
              />
              <input
                inputMode="decimal"
                value={goalTarget}
                onChange={(e) => setGoalTarget(e.target.value)}
                className="mt-2 w-full rounded-xl border border-[var(--color-deep)]/10 bg-[var(--color-cream)] px-3 py-2 outline-none"
                placeholder="Goal target ₱"
              />
            </div>
            {error && <p className="text-sm text-red-700">{error}</p>}
          </div>
          <button
            type="button"
            onClick={finish}
            className="mt-auto w-full cursor-pointer rounded-2xl bg-[var(--color-deep)] py-3.5 font-semibold text-white transition hover:opacity-90"
          >
            Go to Home
          </button>
        </section>
      )}

      <div className="mt-6 flex justify-center gap-2">
        {Array.from({ length: STEPS }).map((_, i) => (
          <span
            key={i}
            className={`h-1.5 w-6 rounded-full transition ${
              i === step ? "bg-[var(--color-deep)]" : "bg-[var(--color-deep)]/20"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
