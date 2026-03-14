import Link from "next/link";
import { redirect } from "next/navigation";

import { addCycle, deleteCycle, updateCycle } from "@/app/cycle/actions";
import { FormSubmitButton } from "@/components/ui/form-submit-button";
import { SimpleLineChart } from "@/components/ui/simple-line-chart";
import {
  averageLength,
  buildMonthGrid,
  deriveCycleLengths,
  fertileWindow,
  humanDate,
  isoDate,
  type CycleRow,
} from "@/lib/cycle/insights";
import { createClient } from "@/utils/supabase/server";

type CyclePageProps = {
  searchParams: Promise<{ error?: string; message?: string; editCycleId?: string }>;
};

type CycleEntry = CycleRow & {
  flow_intensity: number | null;
  notes: string | null;
};

export default async function CyclePage({ searchParams }: CyclePageProps) {
  const params = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: cycles, error } = await supabase
    .from("menstrual_cycles")
    .select("id, cycle_start_date, cycle_end_date, average_cycle_length, flow_intensity, notes, created_at")
    .eq("user_id", user.id)
    .order("cycle_start_date", { ascending: false })
    .limit(18);

  const cycleRows = (cycles ?? []) as CycleEntry[];
  const editCycle = params.editCycleId
    ? cycleRows.find((row) => row.id === params.editCycleId) ?? null
    : null;
  const lengths = deriveCycleLengths(cycleRows);
  const avgCycleLength = averageLength(lengths, 28);

  const latestCycle = cycleRows[0];
  const fertile = latestCycle ? fertileWindow(latestCycle.cycle_start_date, avgCycleLength) : null;

  const nextPeriodDate = latestCycle
    ? (() => {
        const next = new Date(latestCycle.cycle_start_date);
        next.setDate(next.getDate() + avgCycleLength);
        return next;
      })()
    : null;

  const grid = buildMonthGrid(new Date());
  const periodDates = new Set<string>();

  for (const cycle of cycleRows) {
    const start = new Date(cycle.cycle_start_date);
    const end = cycle.cycle_end_date ? new Date(cycle.cycle_end_date) : new Date(cycle.cycle_start_date);

    for (let date = new Date(start); date <= end; date.setDate(date.getDate() + 1)) {
      periodDates.add(isoDate(new Date(date)));
    }
  }

  const fertileDates = new Set<string>();
  if (fertile) {
    for (let date = new Date(fertile.fertileStart); date <= fertile.fertileEnd; date.setDate(date.getDate() + 1)) {
      fertileDates.add(isoDate(new Date(date)));
    }
  }

  const trendPoints = cycleRows
    .slice(0, 8)
    .map((cycle, index) => {
      const explicit = cycle.average_cycle_length;
      if (explicit && explicit >= 20 && explicit <= 45) {
        return {
          value: explicit,
          label: new Date(cycle.cycle_start_date).toLocaleDateString(undefined, {
            month: "short",
            day: "numeric",
          }),
        };
      }

      const next = cycleRows[index + 1];
      if (!next) return null;
      const inferred = Math.abs(
        Math.round(
          (new Date(cycle.cycle_start_date).getTime() - new Date(next.cycle_start_date).getTime()) /
            (1000 * 60 * 60 * 24),
        ),
      );
      if (inferred < 16 || inferred > 60) return null;

      return {
        value: inferred,
        label: new Date(cycle.cycle_start_date).toLocaleDateString(undefined, {
          month: "short",
          day: "numeric",
        }),
      };
    })
    .filter((point): point is { value: number; label: string } => Boolean(point))
    .reverse();
  const trendValues = trendPoints.map((point) => point.value);
  const trendLabels = trendPoints.map((point) => point.label);

  return (
    <main className="bc-page">
      <section className="space-y-5">
        <article className="bc-card space-y-3 p-6">
          <span className="bc-pill">Cycle Tracking</span>
          <h1 className="bc-heading">Cycle and fertility overview</h1>
          <p className="text-sm bc-muted">
            Non-diagnostic estimates based on your recent logs. Track consistently for better predictions.
          </p>
          {error ? <p className="bc-alert-warn">{error.message}</p> : null}
          {params.message ? <p className="bc-alert-info">{params.message}</p> : null}
          {params.error ? <p className="bc-alert-warn">{params.error}</p> : null}
        </article>

        <div className="grid gap-4 md:grid-cols-3">
          <article className="bc-card p-5">
            <p className="text-sm bc-muted">Average cycle length</p>
            <p className="mt-1 text-2xl font-semibold">{avgCycleLength} days</p>
          </article>
          <article className="bc-card p-5">
            <p className="text-sm bc-muted">Next estimated period</p>
            <p className="mt-1 text-2xl font-semibold">{nextPeriodDate ? humanDate(nextPeriodDate) : "Add cycle"}</p>
          </article>
          <article className="bc-card p-5">
            <p className="text-sm bc-muted">Fertile window</p>
            <p className="mt-1 text-base font-semibold">
              {fertile
                ? `${humanDate(fertile.fertileStart)} - ${humanDate(fertile.fertileEnd)}`
                : "Add cycle"}
            </p>
          </article>
        </div>

        <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
          <article className="bc-card p-6">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-lg font-semibold">{grid.monthLabel}</h2>
              <div className="flex gap-2 text-xs">
                <span className="rounded-full bg-[var(--color-accent-50)] px-2 py-1">Period</span>
                <span className="rounded-full bg-[var(--color-support-50)] px-2 py-1">Fertile</span>
              </div>
            </div>
            <div className="grid grid-cols-7 gap-2 text-center text-xs text-[var(--color-neutral-500)]">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                <span key={day}>{day}</span>
              ))}
            </div>
            <div className="mt-2 grid grid-cols-7 gap-2">
              {grid.days.map((day) => {
                const dateKey = isoDate(day);
                const isCurrentMonth = day.getMonth() === grid.month;
                const isToday = isoDate(new Date()) === dateKey;
                const isPeriod = periodDates.has(dateKey);
                const isFertile = fertileDates.has(dateKey);

                return (
                  <div
                    key={dateKey}
                    className={`flex h-11 items-center justify-center rounded-xl border text-sm ${
                      isPeriod
                        ? "border-[var(--color-accent-200)] bg-[var(--color-accent-50)]"
                        : isFertile
                          ? "border-[var(--color-support-200)] bg-[var(--color-support-50)]"
                          : "border-[var(--color-neutral-200)] bg-white"
                    } ${isToday ? "ring-2 ring-[var(--color-primary-500)]" : ""} ${
                      isCurrentMonth ? "text-[var(--color-neutral-800)]" : "text-[var(--color-neutral-400)]"
                    }`}
                  >
                    {day.getDate()}
                  </div>
                );
              })}
            </div>
          </article>

          <article className="bc-card space-y-4 p-6">
            <h2 className="text-lg font-semibold">{editCycle ? "Edit cycle" : "Log period"}</h2>
            <form action={editCycle ? updateCycle : addCycle} className="space-y-3">
              {editCycle ? <input type="hidden" name="id" value={editCycle.id} /> : null}
              <label className="bc-label">
                <span>Cycle start date</span>
                <input
                  name="cycle_start_date"
                  type="date"
                  required
                  defaultValue={editCycle?.cycle_start_date ?? ""}
                  className="bc-input"
                />
              </label>
              <label className="bc-label">
                <span>Cycle end date</span>
                <input
                  name="cycle_end_date"
                  type="date"
                  defaultValue={editCycle?.cycle_end_date ?? ""}
                  className="bc-input"
                />
              </label>
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="bc-label">
                  <span>Flow intensity (1-5)</span>
                  <input
                    name="flow_intensity"
                    type="number"
                    min={1}
                    max={5}
                    defaultValue={editCycle?.flow_intensity ?? ""}
                    className="bc-input"
                  />
                </label>
                <label className="bc-label">
                  <span>Typical length (days)</span>
                  <input
                    name="average_cycle_length"
                    type="number"
                    min={20}
                    max={45}
                    defaultValue={editCycle?.average_cycle_length ?? ""}
                    className="bc-input"
                  />
                </label>
              </div>
              <label className="bc-label">
                <span>Notes</span>
                <textarea
                  name="notes"
                  rows={3}
                  defaultValue={editCycle?.notes ?? ""}
                  className="bc-input"
                />
              </label>
              <FormSubmitButton
                pendingText={editCycle ? "Updating cycle..." : "Saving cycle..."}
                className="bc-btn-primary w-full text-sm"
              >
                {editCycle ? "Update cycle" : "Save cycle"}
              </FormSubmitButton>
            </form>
            {editCycle ? (
              <Link href="/cycle" className="block text-sm text-[var(--color-primary-700)] underline">
                Cancel editing
              </Link>
            ) : null}
            <Link href="/cycle/symptoms" className="block text-sm text-[var(--color-primary-700)] underline">
              Go to symptom log
            </Link>
          </article>
        </div>

        <div className="grid gap-4 lg:grid-cols-[1fr_1fr]">
          <article className="bc-card space-y-4 p-6">
            <h2 className="text-lg font-semibold">Cycle history</h2>
            {!cycleRows.length ? (
              <p className="text-sm bc-muted">No cycles logged yet.</p>
            ) : (
              <ul className="space-y-2">
                {cycleRows.slice(0, 8).map((cycle) => (
                  <li
                    key={cycle.id}
                    className="flex items-center justify-between gap-3 rounded-xl border border-[var(--color-neutral-200)] bg-white px-3 py-2"
                  >
                    <div className="text-sm">
                      <p className="font-medium">{humanDate(cycle.cycle_start_date)}</p>
                      <p className="bc-muted">
                        {cycle.cycle_end_date ? `to ${humanDate(cycle.cycle_end_date)}` : "End date not set"}
                      </p>
                    </div>
                    <form action={deleteCycle}>
                      <input type="hidden" name="id" value={cycle.id} />
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/cycle?editCycleId=${cycle.id}`}
                          className="bc-btn-secondary inline-flex items-center text-sm"
                        >
                          Edit
                        </Link>
                        <FormSubmitButton pendingText="Removing..." className="bc-btn-secondary text-sm">
                          Delete
                        </FormSubmitButton>
                      </div>
                    </form>
                  </li>
                ))}
              </ul>
            )}
          </article>

          <article className="bc-card space-y-4 p-6">
            <h2 className="text-lg font-semibold">Cycle length insights</h2>
            {!trendValues.length ? (
              <p className="text-sm bc-muted">
                Add cycle entries with typical length to visualize your trend graph.
              </p>
            ) : (
              <div className="space-y-3">
                <p className="text-sm bc-muted">Recent cycle lengths trend (days)</p>
                <SimpleLineChart
                  values={trendValues}
                  labels={trendLabels}
                  lineColor="#6439cc"
                  fillColor="rgba(123, 76, 242, 0.16)"
                />
              </div>
            )}
          </article>
        </div>
      </section>
    </main>
  );
}
