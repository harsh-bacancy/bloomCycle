export type PregnancyState = {
  week: number;
  dayInWeek: number;
  trimester: 1 | 2 | 3;
  daysRemaining: number;
  progressPct: number;
};

const MS_PER_DAY = 1000 * 60 * 60 * 24;

export function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

export function toDateOnly(date: Date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function dueDateFromLmp(lmpDate: string) {
  return addDays(new Date(lmpDate), 280);
}

export function lmpFromDueDate(dueDate: string) {
  return addDays(new Date(dueDate), -280);
}

export function pregnancyStateFromLmp(lmpDate: string, today = new Date()): PregnancyState {
  const lmp = toDateOnly(new Date(lmpDate));
  const now = toDateOnly(today);

  const elapsedDays = Math.max(0, Math.floor((now.getTime() - lmp.getTime()) / MS_PER_DAY));
  const cappedDays = Math.min(280, elapsedDays);
  const week = Math.min(40, Math.floor(cappedDays / 7) + 1);
  const dayInWeek = cappedDays % 7;
  const trimester: 1 | 2 | 3 = week <= 13 ? 1 : week <= 27 ? 2 : 3;
  const daysRemaining = Math.max(0, 280 - cappedDays);
  const progressPct = Math.max(0, Math.min(100, Math.round((cappedDays / 280) * 100)));

  return { week, dayInWeek, trimester, daysRemaining, progressPct };
}

export function weekRangeFromLmp(lmpDate: string, weekNumber: number) {
  const clampedWeek = Math.max(1, Math.min(40, weekNumber));
  const start = addDays(new Date(lmpDate), (clampedWeek - 1) * 7);
  const end = addDays(start, 6);
  return { start, end, clampedWeek };
}

export function formatDate(input: Date | string) {
  const date = typeof input === "string" ? new Date(input) : input;
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function weekTip(week: number) {
  if (week <= 12) return "Focus on rest, hydration, and prenatal check-ins.";
  if (week <= 20) return "Track energy and symptoms. Keep appointments consistent.";
  if (week <= 28) return "Monitor movement patterns and discuss any major changes with your clinician.";
  return "Prepare your support plan and keep your care team informed.";
}
