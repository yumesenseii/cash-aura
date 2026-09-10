import Link from "next/link";
import { COPY, PRODUCT } from "@/lib/content";

export default function LandingPage() {
  return (
    <main className="app-atmosphere min-h-[100dvh] text-[var(--color-deep)]">
      <div
        className="relative z-[1] mx-auto flex min-h-[100dvh] max-w-md flex-col px-5"
        style={{
          paddingTop: "max(2rem, env(safe-area-inset-top))",
          paddingBottom: "max(2rem, env(safe-area-inset-bottom))",
        }}
      >
        <div className="flex flex-1 flex-col">
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--color-soft)]">
            Cash companion
          </p>
          <h1 className="mt-3 font-[family-name:var(--font-display)] text-5xl font-bold tracking-tight text-[var(--color-deep)]">
            {PRODUCT.name}
          </h1>
          <p className="mt-3 text-lg leading-snug text-[var(--color-deep)]/80">
            {COPY.landingHeadline}
          </p>
          <p className="mt-4 text-[var(--color-deep)]/65">{COPY.landingBody}</p>

          <div className="surface-hero mt-8 rounded-[1.75rem] p-5 text-white shadow-[var(--shadow-lift)]">
            <p className="relative z-[1] text-sm text-white/75">Safe to Spend</p>
            <p className="relative z-[1] mt-1 text-3xl font-bold">₱180</p>
            <p className="relative z-[1] mt-2 text-xs text-white/65">
              Preview of your daily calm number
            </p>
          </div>

          <ul className="mt-5 space-y-2 text-sm text-[var(--color-deep)]/80">
            {[
              "Safe to Spend — know what’s left today",
              "Cash Timeline — see where money went",
              "Savings First — set aside early",
            ].map((item) => (
              <li
                key={item}
                className="surface-card rounded-2xl px-4 py-3"
              >
                {item}
              </li>
            ))}
          </ul>

          <Link
            href="/app"
            className="btn-save mt-8 flex w-full cursor-pointer items-center justify-center rounded-2xl py-4 text-center text-base font-semibold text-white"
          >
            {COPY.openApp}
          </Link>

          <p className="mt-3 text-center text-xs text-[var(--color-deep)]/50">
            Free · No bank account needed · {PRODUCT.safariNote}
          </p>

          <section className="surface-card mt-10 rounded-[1.6rem] p-5">
            <h2 className="text-lg font-semibold text-[var(--color-deep)]">
              {COPY.installTitle}
            </h2>
            <p className="mt-1 text-sm text-[var(--color-deep)]/60">
              Scan a QR to this page, then add Cashora to your Home Screen.
            </p>
            <ol className="mt-4 space-y-3">
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
            <p className="mt-4 text-xs text-[var(--color-deep)]/50">
              {PRODUCT.privacy}
            </p>
          </section>

          <p className="mt-auto pt-10 text-center text-sm italic text-[var(--color-deep)]/55">
            {PRODUCT.sticky}
          </p>
        </div>
      </div>
    </main>
  );
}
