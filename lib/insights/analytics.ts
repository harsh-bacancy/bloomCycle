import { deriveCycleLengths, type CycleRow } from "@/lib/cycle/insights";

export type SymptomRow = {
  date: string;
  type: string;
  intensity: number | null;
};

export function mean(values: number[]) {
  if (!values.length) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

export function stddev(values: number[]) {
  if (values.length < 2) return 0;
  const m = mean(values);
  const variance = mean(values.map((value) => (value - m) ** 2));
  return Math.sqrt(variance);
}

export function cycleStats(cycles: CycleRow[]) {
  const lengths = deriveCycleLengths(cycles);
  const avg = mean(lengths);
  const sd = stddev(lengths);
  const min = lengths.length ? Math.min(...lengths) : 0;
  const max = lengths.length ? Math.max(...lengths) : 0;

  return {
    lengths,
    avg,
    sd,
    min,
    max,
    irregularityFlag: lengths.length >= 4 && sd > 4,
  };
}

export function symptomsByType(symptoms: SymptomRow[]) {
  return symptoms.reduce<Record<string, number>>((acc, row) => {
    const key = row.type || "other";
    acc[key] = (acc[key] ?? 0) + 1;
    return acc;
  }, {});
}

export function symptomsByPhase(symptoms: SymptomRow[], latestCycleStart?: string | null) {
  const buckets: Record<string, number> = {
    period: 0,
    follicular: 0,
    ovulation: 0,
    luteal: 0,
  };

  if (!latestCycleStart) return buckets;

  const start = new Date(latestCycleStart);

  for (const symptom of symptoms) {
    const date = new Date(symptom.date);
    const day = Math.floor((date.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    if (day < 1 || day > 35) continue;

    if (day <= 5) buckets.period += 1;
    else if (day <= 12) buckets.follicular += 1;
    else if (day <= 16) buckets.ovulation += 1;
    else buckets.luteal += 1;
  }

  return buckets;
}

export function buildInsightCards(input: {
  cycleSampleSize: number;
  cycleAvg: number;
  cycleStdDev: number;
  irregularityFlag: boolean;
  topSymptomType?: string;
  pregnancyWeek?: number | null;
}) {
  const cards: Array<{ title: string; message: string; tone: "info" | "warn" }> = [];

  if (input.cycleSampleSize >= 2) {
    cards.push({
      title: "Cycle pattern",
      message: `Average cycle length is ${Math.round(input.cycleAvg)} days across ${input.cycleSampleSize} samples.`,
      tone: "info",
    });
  }

  if (input.irregularityFlag) {
    cards.push({
      title: "Variability noticed",
      message:
        "Cycle length variability looks higher than usual. This can happen for many reasons; consider tracking consistently and discussing major changes with your clinician.",
      tone: "warn",
    });
  }

  if (input.topSymptomType) {
    cards.push({
      title: "Most logged symptom category",
      message: `${input.topSymptomType} appears most often in your recent logs.`,
      tone: "info",
    });
  }

  if (input.pregnancyWeek && input.pregnancyWeek > 0) {
    cards.push({
      title: "Pregnancy context",
      message: `You are currently around week ${input.pregnancyWeek}. Continue regular check-ins and use kick/contraction tools when needed.`,
      tone: "info",
    });
  }

  return cards;
}
