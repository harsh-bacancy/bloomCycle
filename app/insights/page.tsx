import Link from "next/link";
import { redirect } from "next/navigation";

import { SimpleBarChart } from "@/components/ui/simple-bar-chart";
import { SimpleLineChart } from "@/components/ui/simple-line-chart";
import { generateAiInsightsSummary } from "@/lib/insights/ai-summary";
import { cycleStats, symptomsByPhase, symptomsByType, buildInsightCards, type SymptomRow } from "@/lib/insights/analytics";
import { pregnancyStateFromLmp } from "@/lib/pregnancy/utils";
import { createClient } from "@/utils/supabase/server";

type CycleRow = {
  id: string;
  cycle_start_date: string;
  cycle_end_date: string | null;
  average_cycle_length: number | null;
};

type PregnancyRow = {
  lmp_date: string | null;
  status: "ongoing" | "completed" | "loss";
};

export default async function InsightsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [{ data: cycles }, { data: symptoms }, { data: pregnancies }] = await Promise.all([
    supabase
      .from("menstrual_cycles")
      .select("id, cycle_start_date, cycle_end_date, average_cycle_length")
      .eq("user_id", user.id)
      .order("cycle_start_date", { ascending: false })
      .limit(24),
    supabase
      .from("symptoms")
      .select("date, type, intensity")
      .eq("user_id", user.id)
      .order("date", { ascending: false })
      .limit(200),
    supabase
      .from("pregnancies")
      .select("lmp_date, status")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1),
  ]);

  const cycleRows = (cycles ?? []) as CycleRow[];
  const symptomRows = (symptoms ?? []) as SymptomRow[];
  const pregnancy = ((pregnancies ?? [])[0] ?? null) as PregnancyRow | null;

  const stats = cycleStats(cycleRows);
  const cycleTrendValues = stats.lengths.slice(0, 10).reverse();
  const cycleTrendLabels = cycleTrendValues.map((_, index) => `S${index + 1}`);

  const typeMap = symptomsByType(symptomRows);
  const typeEntries = Object.entries(typeMap).sort((a, b) => b[1] - a[1]);
  const typeLabels = typeEntries.map(([label]) => label);
  const typeValues = typeEntries.map(([, count]) => count);

  const phaseMap = symptomsByPhase(symptomRows, cycleRows[0]?.cycle_start_date);
  const phaseLabels = ["period", "follicular", "ovulation", "luteal"];
  const phaseValues = phaseLabels.map((label) => phaseMap[label] ?? 0);

  const topSymptomType = typeLabels[0];
  const pregnancyWeek = pregnancy?.status === "ongoing" && pregnancy?.lmp_date
    ? pregnancyStateFromLmp(pregnancy.lmp_date).week
    : null;

  const cards = buildInsightCards({
    cycleSampleSize: stats.lengths.length,
    cycleAvg: stats.avg,
    cycleStdDev: stats.sd,
    irregularityFlag: stats.irregularityFlag,
    topSymptomType,
    pregnancyWeek,
  });

  const aiSummary = await generateAiInsightsSummary({
    cycleLengths: stats.lengths,
    cycleAverage: stats.avg,
    cycleStdDev: stats.sd,
    topSymptomType,
    topSymptomCount: typeEntries[0]?.[1] ?? 0,
    totalSymptoms: symptomRows.length,
    phaseCounts: phaseMap,
    pregnancyWeek,
  });

  return (
    <main className="bc-page">
      <section className="space-y-5">
        <article className="bc-card space-y-3 p-6">
          <span className="bc-pill">Insights</span>
          <h1 className="bc-heading">Advanced health pattern insights</h1>
          <p className="text-sm bc-muted">
            These are supportive, non-diagnostic trends from your logs. They are not medical conclusions.
          </p>
        </article>

        <article className="bc-card space-y-3 p-6">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-lg font-semibold">AI analytics summary</h2>
            <span className="bc-pill">{aiSummary.source === "openai" ? "AI-generated" : "Rule-based fallback"}</span>
          </div>
          <ul className="list-disc space-y-1 pl-5 text-sm text-[var(--color-neutral-700)]">
            {aiSummary.points.map((point, idx) => (
              <li key={`${idx}-${point.slice(0, 20)}`}>{point}</li>
            ))}
          </ul>
          <p className="text-xs bc-muted">
            This summary is supportive and non-diagnostic. For urgent or persistent symptoms, contact your healthcare provider.
          </p>
        </article>

        <div className="grid gap-4 md:grid-cols-3">
          <article className="bc-card p-5">
            <p className="text-sm bc-muted">Avg cycle length</p>
            <p className="mt-1 text-2xl font-semibold">{stats.lengths.length ? `${Math.round(stats.avg)} days` : "Not enough data"}</p>
          </article>
          <article className="bc-card p-5">
            <p className="text-sm bc-muted">Cycle variability (std dev)</p>
            <p className="mt-1 text-2xl font-semibold">{stats.lengths.length ? `${stats.sd.toFixed(1)} days` : "Not enough data"}</p>
          </article>
          <article className="bc-card p-5">
            <p className="text-sm bc-muted">Most logged symptom</p>
            <p className="mt-1 text-2xl font-semibold capitalize">{topSymptomType ?? "None"}</p>
          </article>
        </div>

        <div className="grid gap-4 lg:grid-cols-[1fr_1fr]">
          <article className="bc-card space-y-4 p-6">
            <h2 className="text-lg font-semibold">Cycle trend chart</h2>
            {!cycleTrendValues.length ? (
              <p className="text-sm bc-muted">Add at least two cycles to visualize trend patterns.</p>
            ) : (
              <SimpleLineChart values={cycleTrendValues} labels={cycleTrendLabels} lineColor="#6439cc" fillColor="rgba(123,76,242,0.16)" />
            )}
          </article>

          <article className="bc-card space-y-4 p-6">
            <h2 className="text-lg font-semibold">Symptom type distribution</h2>
            {!typeValues.length ? (
              <p className="text-sm bc-muted">No symptom data yet.</p>
            ) : (
              <SimpleBarChart values={typeValues} labels={typeLabels.map((item) => item.slice(0, 5))} barColor="#7b4cf2" />
            )}
          </article>
        </div>

        <article className="bc-card space-y-4 p-6">
          <h2 className="text-lg font-semibold">Symptoms by cycle phase</h2>
          {!phaseValues.some((value) => value > 0) ? (
            <p className="text-sm bc-muted">Phase trends appear after you add cycle and symptom logs.</p>
          ) : (
            <SimpleBarChart values={phaseValues} labels={phaseLabels} barColor="#339a8c" />
          )}
        </article>

        <article className="bc-card space-y-3 p-6">
          <h2 className="text-lg font-semibold">Insight summary</h2>
          {!cards.length ? (
            <p className="text-sm bc-muted">No actionable trends yet. Continue logging for richer insights.</p>
          ) : (
            <ul className="space-y-2">
              {cards.map((card, index) => (
                <li
                  key={`${card.title}-${index}`}
                  className={card.tone === "warn" ? "bc-alert-warn" : "bc-alert-info"}
                >
                  <strong>{card.title}:</strong> {card.message}
                </li>
              ))}
            </ul>
          )}
          <p className="text-xs bc-muted">
            If you notice persistent pain, heavy bleeding, or concerning symptoms, contact your healthcare provider.
          </p>
          <div className="text-sm">
            <Link href="/settings/data-export" className="text-[var(--color-primary-700)] underline">
              Export data
            </Link>
          </div>
        </article>
      </section>
    </main>
  );
}
