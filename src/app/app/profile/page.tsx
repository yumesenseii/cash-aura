"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { PageHeader, Surface } from "@/components/ui/Surface";
import { useCashora } from "@/context/CashoraContext";
import { COPY, FAQ_ITEMS, PRODUCT } from "@/lib/content";
import {
  formatLongDate,
  formatPeso,
  lifetimeStats,
  monthStartId,
  todayId,
} from "@/lib/utils";

const inputClass =
  "w-full rounded-xl border border-[var(--color-deep)]/12 bg-[var(--color-cream)]/80 px-3 py-2.5 text-[var(--color-deep)] outline-none focus:border-[var(--color-soft)]";

function sanitizeCashInput(raw: string) {
  const cleaned = raw.replace(/[^0-9.]/g, "");
  const [whole, ...rest] = cleaned.split(".");
  if (rest.length === 0) return whole;
  return `${whole}.${rest.join("").replace(/\./g, "")}`;
}

export default function ProfilePage() {
  const { state, updatePrefs, resetAll, setStartingCash, today } = useCashora();
  const { prefs } = state;
  const name = prefs.name?.trim() || "";
  const initial = (name[0] || "C").toUpperCase();
  const life = lifetimeStats(state.transactions, state.days);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const canonicalStarting =
    today.hasDay && today.starting > 0
      ? today.starting
      : prefs.defaultStartingCash > 0
        ? prefs.defaultStartingCash
        : 500;

  const [startingDraft, setStartingDraft] = useState(String(canonicalStarting));
  const [startingFocused, setStartingFocused] = useState(false);
  const [startingError, setStartingError] = useState("");

  useEffect(() => {
    if (!startingFocused) {
      setStartingDraft(String(canonicalStarting));
    }
  }, [canonicalStarting, startingFocused]);

  function commitStartingCash(raw: string) {
    const value = Number(raw);
    if (!raw.trim() || !Number.isFinite(value) || value <= 0) {
      setStartingError("Enter an amount greater than 0. Field can’t be blank.");
      setStartingDraft(String(canonicalStarting));
      return;
    }
    const amount = Math.round(value * 100) / 100;
    setStartingError("");
    setStartingDraft(String(amount));
    updatePrefs({ defaultStartingCash: amount });
    setStartingCash(amount);
  }

  const habits = useMemo(() => {
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

    const activeGoals = state.goals.filter(
      (g) => g.currentSaved < g.targetAmount
    ).length;
    const flow = life.spent + life.saved;
    const saveRatio = flow > 0 ? Math.round((life.saved / flow) * 100) : 0;

    const monthStart = monthStartId();
    const today = todayId();
    const monthSaved = state.transactions
      .filter(
        (t) =>
          t.type === "savings" &&
          t.dayId >= monthStart &&
          t.dayId <= today
      )
      .reduce((s, t) => s + t.amount, 0);

    const oldest = [...state.days].sort((a, b) =>
      a.date.localeCompare(b.date)
    )[0];

    return {
      streak,
      activeGoals,
      saveRatio,
      monthSaved,
      trackingSince: oldest?.date,
    };
  }, [state.days, state.goals, state.transactions, life.spent, life.saved]);

  const allowanceLabel =
    prefs.allowanceRhythm === "weekly"
      ? "Weekly allowance"
      : prefs.allowanceRhythm === "irregular"
        ? "Irregular cash"
        : "Daily baon";

  function exportData() {
    const blob = new Blob([JSON.stringify(state, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `cashora-backup-${todayId()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-4">
      <PageHeader
        title="Profile"
        subtitle="How you manage your cash companion"
        eyebrow="You"
      />

      <section className="surface-hero fade-up rounded-[1.75rem] p-5 text-white">
        <div className="relative z-[1] flex items-center gap-4">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-white/15 text-2xl font-bold backdrop-blur-sm">
            {initial}
          </div>
          <div className="min-w-0">
            <p className="text-sm text-white/70">Hi there</p>
            <p className="truncate text-xl font-bold tracking-tight">
              {name || "Cashora friend"}
            </p>
            <p className="mt-1 text-xs text-white/65">
              ₱ · {allowanceLabel}
              {habits.trackingSince
                ? ` · Since ${formatLongDate(habits.trackingSince)}`
                : ""}
            </p>
          </div>
        </div>
        <div className="relative z-[1] mt-4 flex flex-wrap gap-2">
          <QuickLink href="/app" label="Home" />
          <QuickLink href="/app/goals" label="Goals" />
          <QuickLink href="/app/insights" label="Insights" />
        </div>
      </section>

      <Surface className="fade-up p-4">
        <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--color-deep)]/45">
          Habit snapshot
        </p>
        <div className="mt-3 grid grid-cols-2 gap-2">
          <StatTile label="Streak" value={`${habits.streak}d`} />
          <StatTile label="Active goals" value={String(habits.activeGoals)} />
          <StatTile
            label="Save ratio"
            value={`${habits.saveRatio}%`}
            hint="Of logged cash flow"
          />
          <StatTile
            label="Saved this month"
            value={formatPeso(habits.monthSaved)}
          />
          <StatTile label="Days tracked" value={String(life.daysTracked)} />
          <StatTile label="Total logs" value={String(life.logs)} />
          <StatTile
            label="Lifetime spent"
            value={formatPeso(life.spent)}
            accent="brown"
          />
          <StatTile
            label="Lifetime saved"
            value={formatPeso(life.saved)}
          />
        </div>
      </Surface>

      <Surface className="fade-up p-4">
        <p className="text-sm leading-relaxed text-[var(--color-deep)]/75">
          Tip: Savings First — set aside a little when cash arrives, before
          snacks and jeepney rides disappear it.
        </p>
      </Surface>

      <Surface className="fade-up space-y-4 p-5">
        <SectionTitle>Personal</SectionTitle>
        <FieldLabel label="Display name">
          <input
            value={prefs.name}
            onChange={(e) => updatePrefs({ name: e.target.value })}
            className={inputClass}
            placeholder="Your name"
          />
        </FieldLabel>
        <FieldLabel label="Allowance rhythm">
          <select
            value={prefs.allowanceRhythm || "daily"}
            onChange={(e) =>
              updatePrefs({
                allowanceRhythm: e.target.value as
                  | "daily"
                  | "weekly"
                  | "irregular",
              })
            }
            className={`${inputClass} cursor-pointer`}
          >
            <option value="daily">Daily baon</option>
            <option value="weekly">Weekly allowance</option>
            <option value="irregular">Irregular cash</option>
          </select>
        </FieldLabel>
      </Surface>

      <Surface className="fade-up space-y-4 p-5">
        <SectionTitle>Cash defaults</SectionTitle>
        <FieldLabel
          label="Starting cash (₱)"
          hint="Updates Home for today, and is saved as your default for new days"
        >
          <input
            inputMode="decimal"
            type="text"
            autoComplete="off"
            value={startingDraft}
            onFocus={() => {
              setStartingFocused(true);
              setStartingError("");
            }}
            onChange={(e) => {
              setStartingDraft(sanitizeCashInput(e.target.value));
              if (startingError) setStartingError("");
            }}
            onBlur={() => {
              setStartingFocused(false);
              commitStartingCash(startingDraft);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.currentTarget.blur();
              }
            }}
            aria-invalid={Boolean(startingError)}
            className={inputClass}
          />
        </FieldLabel>
        {startingError ? (
          <p className="text-sm text-red-700">{startingError}</p>
        ) : null}
        <p className="rounded-xl bg-[var(--color-mist)]/50 px-3 py-2 text-xs text-[var(--color-deep)]/60">
          Currency stays Philippine Peso (₱). Cashora tracks physical cash — not
          a wallet or bank. You can also edit today&apos;s start from Home → Edit
          start.
        </p>
      </Surface>

      <Surface className="fade-up space-y-4 p-5">
        <SectionTitle>Reminders</SectionTitle>
        <label className="flex items-center justify-between gap-3 rounded-xl bg-[var(--color-mist)]/50 px-3 py-3">
          <div>
            <p className="text-sm font-medium text-[var(--color-deep)]">
              Daily Cash Check
            </p>
            <p className="mt-0.5 text-xs text-[var(--color-deep)]/50">
              In-app evening prompt — no iOS web push
            </p>
          </div>
          <input
            type="checkbox"
            checked={prefs.dailyCheckEnabled}
            onChange={(e) =>
              updatePrefs({ dailyCheckEnabled: e.target.checked })
            }
            className="h-5 w-5 cursor-pointer accent-[var(--color-deep)]"
          />
        </label>
        <FieldLabel label="Reminder time">
          <input
            type="time"
            value={prefs.dailyCheckTime}
            onChange={(e) => updatePrefs({ dailyCheckTime: e.target.value })}
            className={`${inputClass} cursor-pointer`}
          />
        </FieldLabel>
      </Surface>

      <Surface className="fade-up p-5">
        <SectionTitle>Install on iPhone</SectionTitle>
        <p className="mt-1 text-sm text-[var(--color-deep)]/65">
          Add Cashora to your Home Screen so it feels like an app.{" "}
          {PRODUCT.safariNote}.
        </p>
        <ol className="mt-4 space-y-2.5">
          {COPY.installSteps.map((step, i) => (
            <li key={step} className="flex gap-3 text-sm">
              <span
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl text-xs font-bold text-white"
                style={{ background: "var(--grad-hero)" }}
              >
                {i + 1}
              </span>
              <span className="pt-1 text-[var(--color-deep)]">{step}</span>
            </li>
          ))}
        </ol>
        <Link
          href="/"
          className="mt-4 inline-flex cursor-pointer text-sm font-semibold text-[var(--color-deep)] underline-offset-2 hover:underline"
        >
          Open landing page
        </Link>
      </Surface>

      <Surface className="fade-up p-5">
        <SectionTitle>Help</SectionTitle>
        <p className="mt-1 text-sm text-[var(--color-deep)]/60">{COPY.faqTitle}</p>
        <ul className="mt-3 space-y-2">
          {FAQ_ITEMS.map((item, i) => {
            const open = openFaq === i;
            return (
              <li
                key={item.q}
                className="overflow-hidden rounded-2xl bg-[var(--color-mist)]/45"
              >
                <button
                  type="button"
                  onClick={() => setOpenFaq(open ? null : i)}
                  className="flex w-full cursor-pointer items-center justify-between gap-3 px-3 py-3 text-left"
                >
                  <span className="text-sm font-semibold text-[var(--color-deep)]">
                    {item.q}
                  </span>
                  <span className="text-[var(--color-deep)]/45">
                    {open ? "−" : "+"}
                  </span>
                </button>
                {open && (
                  <p className="border-t border-[var(--color-deep)]/8 px-3 pb-3 pt-2 text-sm leading-relaxed text-[var(--color-deep)]/70">
                    {item.a}
                  </p>
                )}
              </li>
            );
          })}
        </ul>
      </Surface>

      <Surface className="fade-up p-5">
        <SectionTitle>Data & privacy</SectionTitle>
        <p className="mt-2 text-sm leading-relaxed text-[var(--color-deep)]/70">
          {PRODUCT.privacy}
        </p>
        <ul className="mt-3 space-y-1.5 text-sm text-[var(--color-deep)]/65">
          <li>• Days, transactions, goals, and preferences</li>
          <li>• Stored in this browser / Home Screen app only</li>
          <li>• No account, no cloud sync in this MVP</li>
        </ul>
        <p className="mt-3 text-xs text-[var(--color-deep)]/45">
          {PRODUCT.disclaimer}
        </p>
        <button
          type="button"
          onClick={exportData}
          className="btn-save mt-4 w-full cursor-pointer rounded-2xl py-2.5 text-sm font-semibold text-white"
        >
          Export backup (JSON)
        </button>
      </Surface>

      <Surface className="fade-up p-5">
        <SectionTitle>About Cashora</SectionTitle>
        <p className="mt-2 text-sm leading-relaxed text-[var(--color-deep)]/70">
          {PRODUCT.about}
        </p>
        <p className="mt-3 text-sm italic text-[var(--color-deep)]/55">
          {PRODUCT.sticky}
        </p>
        <p className="mt-2 text-xs text-[var(--color-deep)]/45">
          {PRODUCT.tagline}
        </p>
      </Surface>

      <Surface className="fade-up border border-red-200/80 p-5">
        <p className="font-semibold text-red-800">Danger zone</p>
        <p className="mt-1 text-sm text-[var(--color-deep)]/60">
          Clears all cash logs, goals, and preferences on this device. This
          cannot be undone — export a backup first if you need it.
        </p>
        <button
          type="button"
          onClick={() => {
            if (
              window.confirm(
                "Reset Cashora on this device? This cannot be undone."
              )
            ) {
              resetAll();
              window.location.href = "/app/onboarding";
            }
          }}
          className="mt-3 cursor-pointer rounded-xl bg-gradient-to-r from-red-700 to-red-600 px-4 py-2.5 text-sm font-semibold text-white shadow-[0_8px_18px_rgba(185,28,28,0.25)] transition hover:opacity-90"
        >
          Reset all data
        </button>
      </Surface>

      <p className="pb-4 text-center text-xs text-[var(--color-deep)]/40">
        Cashora v0.1.0 · Not a wallet. Not a bank.
      </p>
    </div>
  );
}

function QuickLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="cursor-pointer rounded-xl bg-white/15 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-white/25"
    >
      {label}
    </Link>
  );
}

function SectionTitle({ children }: { children: ReactNode }) {
  return (
    <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--color-deep)]/45">
      {children}
    </p>
  );
}

function FieldLabel({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm text-[var(--color-deep)]/70">
        {label}
      </span>
      {children}
      {hint && (
        <span className="mt-1 block text-xs text-[var(--color-deep)]/50">
          {hint}
        </span>
      )}
    </label>
  );
}

function StatTile({
  label,
  value,
  hint,
  accent,
}: {
  label: string;
  value: string;
  hint?: string;
  accent?: "brown" | "deep";
}) {
  const valueClass =
    accent === "brown"
      ? "text-[var(--color-brown)]"
      : "text-[var(--color-deep)]";
  return (
    <div className="rounded-xl bg-[var(--color-mist)]/50 px-3 py-2.5">
      <p className="text-[10px] uppercase tracking-wide text-[var(--color-deep)]/45">
        {label}
      </p>
      <p className={`mt-0.5 text-lg font-bold tabular-nums ${valueClass}`}>
        {value}
      </p>
      {hint && (
        <p className="mt-0.5 text-[10px] text-[var(--color-deep)]/45">{hint}</p>
      )}
    </div>
  );
}
