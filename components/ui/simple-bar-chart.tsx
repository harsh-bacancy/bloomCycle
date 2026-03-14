type SimpleBarChartProps = {
  values: number[];
  labels?: string[];
  height?: number;
  barColor?: string;
};

export function SimpleBarChart({
  values,
  labels = [],
  height = 180,
  barColor = "#7b4cf2",
}: SimpleBarChartProps) {
  const max = Math.max(...values, 1);

  if (!values.length) {
    return <p className="text-sm bc-muted">No chart data available yet.</p>;
  }

  return (
    <div className="space-y-2">
      <div className="flex items-end gap-2" style={{ height }}>
        {values.map((value, index) => {
          const pct = Math.max(8, Math.round((value / max) * 100));
          return (
            <div key={index} className="flex h-full flex-1 flex-col items-center justify-end gap-1">
              <div
                className="w-full rounded-md"
                style={{ height: `${pct}%`, background: barColor }}
                title={`${value}`}
              />
            </div>
          );
        })}
      </div>
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
