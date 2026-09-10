type Point = { label: string; value: number };

type AreaSparkProps = {
  points: Point[];
  height?: number;
  color?: string;
};

export function AreaSpark({
  points,
  height = 120,
  color = "#8fafc0",
}: AreaSparkProps) {
  const width = 320;
  const padX = 8;
  const padY = 12;
  const values = points.map((p) => p.value);
  const max = Math.max(...values, 1);
  const min = 0;
  const span = Math.max(max - min, 1);

  const coords = points.map((p, i) => {
    const x =
      padX + (i / Math.max(points.length - 1, 1)) * (width - padX * 2);
    const y =
      height - padY - ((p.value - min) / span) * (height - padY * 2);
    return { x, y, ...p };
  });

  const line = coords
    .map((c, i) => `${i === 0 ? "M" : "L"} ${c.x.toFixed(1)} ${c.y.toFixed(1)}`)
    .join(" ");
  const area = `${line} L ${coords[coords.length - 1]?.x ?? padX} ${
    height - padY
  } L ${coords[0]?.x ?? padX} ${height - padY} Z`;

  const last = coords[coords.length - 1];

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="h-auto w-full"
      role="img"
      aria-label="Weekly cash activity chart"
    >
      <defs>
        <linearGradient id="cashoraArea" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.45" />
          <stop offset="100%" stopColor={color} stopOpacity="0.02" />
        </linearGradient>
      </defs>
      <path d={area} fill="url(#cashoraArea)" />
      <path
        d={line}
        fill="none"
        stroke={color}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {last && (
        <circle cx={last.x} cy={last.y} r="4.5" fill="#294c60" stroke="#fffdf8" strokeWidth="2" />
      )}
    </svg>
  );
}
