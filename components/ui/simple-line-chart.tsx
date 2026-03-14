type SimpleLineChartProps = {
  values: number[];
  labels?: string[];
  height?: number;
  lineColor?: string;
  fillColor?: string;
};

export function SimpleLineChart({
  values,
  labels = [],
  height = 220,
  lineColor = "#7b4cf2",
  fillColor = "rgba(123, 76, 242, 0.12)",
}: SimpleLineChartProps) {
  const width = 640;
  const padding = 28;

  if (!values.length) {
    return <p className="text-sm bc-muted">No chart data available yet.</p>;
  }

  const max = Math.max(...values, 1);
  const min = Math.min(...values, 0);
  const range = Math.max(1, max - min);

  const points = values.map((value, index) => {
    const x = padding + (index * (width - padding * 2)) / Math.max(values.length - 1, 1);
    const y = height - padding - ((value - min) / range) * (height - padding * 2);
    return { x, y, value };
  });

  const polyline = points.map((point) => `${point.x},${point.y}`).join(" ");
  const area = `${padding},${height - padding} ${polyline} ${width - padding},${height - padding}`;

  return (
    <div className="space-y-2">
      <svg viewBox={`0 0 ${width} ${height}`} className="h-56 w-full">
        <line x1={padding} y1={padding} x2={padding} y2={height - padding} stroke="#d1d5db" strokeWidth="1" />
        <line
          x1={padding}
          y1={height - padding}
          x2={width - padding}
          y2={height - padding}
          stroke="#d1d5db"
          strokeWidth="1"
        />
        <polygon points={area} fill={fillColor} />
        <polyline points={polyline} fill="none" stroke={lineColor} strokeWidth="3" strokeLinecap="round" />
        {points.map((point, index) => (
          <g key={index}>
            <circle cx={point.x} cy={point.y} r="4" fill="#fff" stroke={lineColor} strokeWidth="2" />
          </g>
        ))}
      </svg>
      {labels.length ? (
        <div className="grid gap-2 text-xs text-[var(--color-neutral-500)]" style={{ gridTemplateColumns: `repeat(${labels.length}, minmax(0, 1fr))` }}>
          {labels.map((label, index) => (
            <span key={`${label}-${index}`} className="truncate text-center" title={label}>
              {label}
            </span>
          ))}
        </div>
      ) : null}
    </div>
  );
}
