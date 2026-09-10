"use client";

import { useEffect, useId, useRef, type ReactNode } from "react";

type ModalProps = {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
};

export function Modal({ open, title, onClose, children }: ModalProps) {
  const titleId = useId();
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center sm:items-center sm:p-4">
      <button
        type="button"
        className="absolute inset-0 cursor-pointer bg-[var(--color-deep)]/45 backdrop-blur-[2px]"
        aria-label="Close"
        onClick={onClose}
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="surface-card relative z-10 flex max-h-[min(92dvh,720px)] w-full max-w-md flex-col overflow-hidden rounded-t-3xl shadow-[var(--shadow-lift)] sm:rounded-3xl animate-sheet"
      >
        <div className="flex shrink-0 items-center justify-between gap-3 border-b border-[var(--color-deep)]/6 px-5 pb-3 pt-5">
          <h2
            id={titleId}
            className="font-[family-name:var(--font-display)] text-lg font-semibold text-[var(--color-deep)]"
          >
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="cursor-pointer rounded-xl bg-[var(--color-mist)] px-3 py-1 text-sm text-[var(--color-deep)]/70 transition hover:bg-[var(--color-cream)]"
          >
            Close
          </button>
        </div>
        <div
          className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 pt-4 [-webkit-overflow-scrolling:touch]"
          style={{
            paddingBottom: "max(1.5rem, calc(env(safe-area-inset-bottom) + 1rem))",
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
