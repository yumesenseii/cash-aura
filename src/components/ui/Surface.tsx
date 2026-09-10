import type { CSSProperties, ReactNode } from "react";

type SurfaceProps = {
  children: ReactNode;
  className?: string;
  as?: "div" | "section" | "li" | "article";
  style?: CSSProperties;
};

export function Surface({
  children,
  className = "",
  as: Tag = "div",
  style,
}: SurfaceProps) {
  return (
    <Tag className={`surface-card rounded-[1.6rem] ${className}`} style={style}>
      {children}
    </Tag>
  );
}

export function PageHeader({
  title,
  subtitle,
  eyebrow,
  action,
}: {
  title: string;
  subtitle?: string;
  eyebrow?: string;
  action?: ReactNode;
}) {
  return (
    <header className="fade-up mb-1">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          {eyebrow && (
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--color-soft)]">
              {eyebrow}
            </p>
          )}
          <h1 className="mt-1 font-[family-name:var(--font-display)] text-[1.85rem] font-semibold tracking-tight text-[var(--color-deep)]">
            {title}
          </h1>
          {subtitle && (
            <p className="mt-1 text-sm text-[var(--color-deep)]/58">{subtitle}</p>
          )}
        </div>
        {action ? <div className="shrink-0 pt-1">{action}</div> : null}
      </div>
    </header>
  );
}
