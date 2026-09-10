"use client";

import type { ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "brown" | "blue" | "ghost" | "soft";

const styles: Record<Variant, string> = {
  brown:
    "bg-[var(--warm-brown)] text-white shadow-sm hover:brightness-105 active:scale-[0.98]",
  blue: "bg-[var(--deep-blue)] text-white shadow-sm hover:brightness-110 active:scale-[0.98]",
  soft: "bg-[var(--soft-blue)] text-[var(--deep-blue)] hover:brightness-105 active:scale-[0.98]",
  ghost:
    "bg-transparent text-[var(--deep-blue)] border border-[var(--deep-blue)]/15 hover:bg-white/60 active:scale-[0.98]",
};

export function Button({
  variant = "blue",
  className = "",
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      className={`cursor-pointer inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-3.5 text-[15px] font-semibold transition duration-200 disabled:opacity-50 disabled:pointer-events-none ${styles[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
