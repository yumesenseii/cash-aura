type RingProgressProps = {
  percent: number;
  size?: number;
  stroke?: number;
  label?: string;
  sublabel?: string;
  tone?: "soft" | "brown" | "deep";
  inverted?: boolean;
};

const TONES = {
  soft: "#8fafc0",
  brown: "#8b6248",
  deep: "#294c60",
};

export function RingProgress({
  percent,
  size = 112,
  stroke = 10,
  label,
  sublabel,
  tone = "soft",
  inverted = false,
}: RingProgressProps) {
  const p = Math.max(0, Math.min(100, percent));
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const offset = c - (p / 100) * c;
  const color = inverted ? "#fffdf8" : TONES[tone];
  const track = inverted ? "rgba(255,253,248,0.22)" : "rgba(41,76,96,0.1)";

  return (
    <div
      className="relative inline-flex items-center justify-center"
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={track}
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 500ms ease" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <span
          className={`text-lg font-bold tabular-nums ${
            inverted ? "text-white" : "text-[var(--color-deep)]"
          }`}
        >
          {label ?? `${Math.round(p)}%`}
        </span>
        {sublabel && (
          <span
            className={`text-[10px] ${
              inverted ? "text-white/70" : "text-[var(--color-deep)]/50"
            }`}
          >
            {sublabel}
          </span>
        )}
      </div>
    </div>
  );
}
