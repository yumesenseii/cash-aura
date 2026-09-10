"use client";

import { BottomNav } from "@/components/BottomNav";
import { CashoraProvider } from "@/context/CashoraContext";
import { usePathname } from "next/navigation";

export default function AppShellLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const hideNav = pathname?.includes("/onboarding");

  return (
    <CashoraProvider>
      <div className="app-atmosphere min-h-[100dvh] text-[var(--color-deep)]">
        <div
          className="relative z-[1] mx-auto min-h-[100dvh] max-w-md px-4 pt-[max(1rem,env(safe-area-inset-top))]"
          style={{
            paddingBottom: hideNav
              ? "max(1.5rem, env(safe-area-inset-bottom))"
              : "calc(5.5rem + env(safe-area-inset-bottom))",
          }}
        >
          {children}
        </div>
        {!hideNav && <BottomNav />}
      </div>
    </CashoraProvider>
  );
}
