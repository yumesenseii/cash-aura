"use client";

import { useEffect, type ReactNode } from "react";

export function Modal({
  open,
  title,
  onClose,
  children,
}: {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
}) {
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
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Close"
        className="absolute inset-0 cursor-pointer bg-[var(--deep-blue)]/40 backdrop-blur-[2px]"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="animate-modal-in relative z-10 flex max-h-[min(85dvh,640px)] w-full max-w-md flex-col overflow-hidden rounded-3xl bg-[var(--off-white)] shadow-xl"
      >
        <div className="flex shrink-0 items-center justify-between gap-3 border-b border-black/5 px-5 pb-3 pt-5">
          <h2 className="text-lg font-bold text-[var(--deep-blue)]">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="cursor-pointer rounded-full px-3 py-1 text-sm font-medium text-[var(--deep-blue)]/60 hover:bg-black/5"
          >
            Close
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 pb-5 pt-4 [-webkit-overflow-scrolling:touch]">
          {children}
        </div>
      </div>
    </div>
  );
}
