import Link from "next/link";
import { redirect } from "next/navigation";

import { addPregnancyLog, savePregnancy } from "@/app/pregnancy/actions";
import { FormSubmitButton } from "@/components/ui/form-submit-button";
import { createClient } from "@/utils/supabase/server";
import { formatDate, pregnancyStateFromLmp, weekTip } from "@/lib/pregnancy/utils";

type PregnancyPageProps = {
  searchParams: Promise<{ error?: string; message?: string }>;
};

type PregnancyRow = {
  id: string;
  lmp_date: string | null;
  estimated_due_date: string | null;
  status: "ongoing" | "completed" | "loss";
};

type PregnancyLogRow = {
  id: string;
  week_number: number;
  weight: number | null;
  notes: string | null;
  logged_at: string;
};

export default async function PregnancyPage({ searchParams }: PregnancyPageProps) {
  const params = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: pregnancies, error } = await supabase
    .from("pregnancies")
    .select("id, lmp_date, estimated_due_date, status")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(1);

  const pregnancy = ((pregnancies ?? [])[0] ?? null) as PregnancyRow | null;

  const { data: logs } = pregnancy
    ? await supabase
        .from("pregnancy_logs")
        .select("id, week_number, weight, notes, logged_at")
        .eq("pregnancy_id", pregnancy.id)
        .order("week_number", { ascending: false })
        .limit(12)
    : { data: [] as PregnancyLogRow[] };

  const lmpDate = pregnancy?.lmp_date;
  const state = lmpDate ? pregnancyStateFromLmp(lmpDate) : null;

  return (
    <main className="bc-page">
      <section className="space-y-5">
        <article className="bc-card space-y-3 p-6">
          <span className="bc-pill">Pregnancy Overview</span>
          <h1 className="bc-heading">Week-by-week pregnancy dashboard</h1>
          <p className="text-sm bc-muted">Supportive tracking only. This does not replace professional medical advice.</p>
          {error ? <p className="bc-alert-warn">{error.message}</p> : null}
          {params.message ? <p className="bc-alert-info">{params.message}</p> : null}
          {params.error ? <p className="bc-alert-warn">{params.error}</p> : null}
        </article>

        <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
          <article className="bc-card space-y-4 p-6">
            <h2 className="text-lg font-semibold">Pregnancy setup</h2>
            <form action={savePregnancy} className="space-y-3">
              {pregnancy ? <input type="hidden" name="id" value={pregnancy.id} /> : null}
              <label className="bc-label">
                <span>Last menstrual period (LMP)</span>
                <input name="lmp_date" type="date" defaultValue={pregnancy?.lmp_date ?? ""} className="bc-input" />
              </label>
              <label className="bc-label">
                <span>Estimated due date</span>
                <input
                  name="estimated_due_date"
                  type="date"
                  defaultValue={pregnancy?.estimated_due_date ?? ""}
                  className="bc-input"
                />
              </label>
              <label className="bc-label">
                <span>Status</span>
                <select name="status" className="bc-input" defaultValue={pregnancy?.status ?? "ongoing"}>
                  <option value="ongoing">Ongoing</option>
                  <option value="completed">Completed</option>
                  <option value="loss">Loss</option>
                </select>
              </label>
              <FormSubmitButton pendingText="Saving..." className="bc-btn-primary w-full text-sm">
                {pregnancy ? "Update pregnancy" : "Save pregnancy"}
              </FormSubmitButton>
            </form>

            <div className="grid gap-2 text-sm">
              <Link href="/pregnancy/kick-counter" className="bc-btn-secondary inline-flex items-center justify-center">
                Open kick counter
              </Link>
              <Link
                href="/pregnancy/contraction-timer"
                className="bc-btn-secondary inline-flex items-center justify-center"
              >
                Open contraction timer
              </Link>
            </div>
          </article>

          <article className="bc-card space-y-4 p-6">
            <h2 className="text-lg font-semibold">Current progress</h2>
            {!pregnancy || !state ? (
              <p className="text-sm bc-muted">Save LMP or due date to calculate your current week and trimester.</p>
            ) : (
              <div className="space-y-3">
                <p className="text-2xl font-semibold">Week {state.week}</p>
                <p className="text-sm bc-muted">Trimester {state.trimester} • Day {state.dayInWeek} of this week</p>
                <div className="h-3 rounded-full bg-[var(--color-neutral-200)]">
                  <div
                    className="h-3 rounded-full bg-[var(--color-primary-500)]"
                    style={{ width: `${state.progressPct}%` }}
                  />
                </div>
                <p className="text-sm bc-muted">{state.progressPct}% complete • {state.daysRemaining} days remaining</p>
                <p className="rounded-xl bg-[var(--color-support-50)] px-3 py-2 text-sm text-[var(--color-support-600)]">
                  {weekTip(state.week)}
                </p>
                <Link
                  href={`/pregnancy/week/${state.week}`}
                  className="text-sm text-[var(--color-primary-700)] underline"
                >
                  Open week {state.week} details
                </Link>
              </div>
            )}
          </article>
        </div>

        <div className="grid gap-4 lg:grid-cols-[1fr_1fr]">
          <article className="bc-card space-y-4 p-6">
            <h2 className="text-lg font-semibold">Weekly check-in</h2>
            {!pregnancy || !state ? (
              <p className="text-sm bc-muted">Set up pregnancy first to save weekly logs.</p>
            ) : (
              <form action={addPregnancyLog} className="space-y-3">
                <input type="hidden" name="pregnancy_id" value={pregnancy.id} />
                <label className="bc-label">
                  <span>Week number</span>
                  <input name="week_number" type="number" min={1} max={40} defaultValue={state.week} className="bc-input" />
                </label>
                <label className="bc-label">
                  <span>Weight (kg)</span>
                  <input name="weight" type="number" step="0.1" min={30} max={200} className="bc-input" />
                </label>
                <div className="grid gap-3 sm:grid-cols-3">
                  <label className="bc-label">
                    <span>Mood</span>
                    <select name="mood" className="bc-input" defaultValue="">
                      <option value="">Select</option>
                      <option value="good">Good</option>
                      <option value="mixed">Mixed</option>
                      <option value="low">Low</option>
                    </select>
                  </label>
                  <label className="bc-label">
                    <span>Energy</span>
                    <select name="energy" className="bc-input" defaultValue="">
                      <option value="">Select</option>
                      <option value="high">High</option>
                      <option value="medium">Medium</option>
                      <option value="low">Low</option>
                    </select>
                  </label>
                  <label className="bc-label">
                    <span>Pain</span>
                    <select name="pain" className="bc-input" defaultValue="">
                      <option value="">Select</option>
                      <option value="none">None</option>
                      <option value="mild">Mild</option>
                      <option value="moderate">Moderate</option>
                      <option value="high">High</option>
                    </select>
                  </label>
                </div>
                <label className="bc-label">
                  <span>Notes</span>
                  <textarea name="notes" rows={3} className="bc-input" />
                </label>
                <FormSubmitButton pendingText="Saving log..." className="bc-btn-primary w-full text-sm">
                  Save weekly log
                </FormSubmitButton>
              </form>
            )}
          </article>

          <article className="bc-card space-y-4 p-6">
            <h2 className="text-lg font-semibold">Recent logs</h2>
            {!logs?.length ? (
              <p className="text-sm bc-muted">No weekly logs yet.</p>
            ) : (
              <ul className="space-y-2">
                {(logs as PregnancyLogRow[]).map((log) => (
                  <li key={log.id} className="rounded-xl border border-[var(--color-neutral-200)] bg-white px-3 py-2 text-sm">
                    <p className="font-medium">Week {log.week_number}</p>
                    <p className="bc-muted">{formatDate(log.logged_at)}</p>
                    {log.weight ? <p className="bc-muted">Weight: {log.weight} kg</p> : null}
                    {log.notes ? <p className="bc-muted">{log.notes}</p> : null}
                  </li>
                ))}
              </ul>
            )}
          </article>
        </div>
      </section>
    </main>
  );
}
