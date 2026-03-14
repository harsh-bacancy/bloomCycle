export type CycleRow = {
  id: string;
  cycle_start_date: string;
  cycle_end_date: string | null;
  average_cycle_length: number | null;
};

export function daysBetween(startDate: string, endDate: string) {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffMs = end.getTime() - start.getTime();
  return Math.round(diffMs / (1000 * 60 * 60 * 24));
}

export function deriveCycleLengths(cycles: CycleRow[]) {
  const lengths: number[] = [];

  for (let i = 0; i < cycles.length - 1; i += 1) {
    const current = cycles[i];
    const next = cycles[i + 1];
    const diff = daysBetween(next.cycle_start_date, current.cycle_start_date);
    if (diff > 15 && diff < 60) {
      lengths.push(diff);
    }
  }

  return lengths;
}

export function averageLength(lengths: number[], fallback = 28) {
  if (!lengths.length) return fallback;
  return Math.round(lengths.reduce((sum, value) => sum + value, 0) / lengths.length);
}

export function fertileWindow(cycleStartDate: string, cycleLength = 28) {
  const start = new Date(cycleStartDate);
  const ovulationOffset = Math.max(8, cycleLength - 14);
  const ovulationDate = new Date(start);
  ovulationDate.setDate(start.getDate() + ovulationOffset);

  const fertileStart = new Date(ovulationDate);
  fertileStart.setDate(ovulationDate.getDate() - 5);

  const fertileEnd = new Date(ovulationDate);
  fertileEnd.setDate(ovulationDate.getDate() + 1);

  return {
    ovulationDate,
    fertileStart,
    fertileEnd,
  };
}

export function isoDate(date: Date) {
  return date.toISOString().slice(0, 10);
}

export function humanDate(input: Date | string) {
  const date = typeof input === "string" ? new Date(input) : input;
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function buildMonthGrid(baseDate = new Date()) {
  const year = baseDate.getFullYear();
  const month = baseDate.getMonth();
  const first = new Date(year, month, 1);
  const startOffset = first.getDay();

  const gridStart = new Date(first);
  gridStart.setDate(first.getDate() - startOffset);

  const days: Date[] = [];
  for (let i = 0; i < 42; i += 1) {
    const day = new Date(gridStart);
    day.setDate(gridStart.getDate() + i);
    days.push(day);
  }

  return {
    year,
    month,
    monthLabel: baseDate.toLocaleDateString(undefined, { month: "long", year: "numeric" }),
    days,
  };
}
