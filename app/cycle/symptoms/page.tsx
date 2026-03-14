import Link from "next/link";
import { redirect } from "next/navigation";

import { addSymptom, deleteSymptom, updateSymptom } from "@/app/cycle/actions";
import { FormSubmitButton } from "@/components/ui/form-submit-button";
import { SimpleBarChart } from "@/components/ui/simple-bar-chart";
import { createClient } from "@/utils/supabase/server";

type SymptomsPageProps = {
  searchParams: Promise<{ error?: string; message?: string; editSymptomId?: string }>;
};

type SymptomRow = {
  id: string;
  date: string;
  type: string;
  label: string;
  intensity: number | null;
  metadata: { notes?: string } | null;
};

export default async function SymptomsPage({ searchParams }: SymptomsPageProps) {
  const params = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data, error } = await supabase
    .from("symptoms")
    .select("id, date, type, label, intensity, metadata")
    .eq("user_id", user.id)
    .order("date", { ascending: false })
    .limit(30);

  const symptoms = (data ?? []) as SymptomRow[];
  const editSymptom = params.editSymptomId
    ? symptoms.find((row) => row.id === params.editSymptomId) ?? null
    : null;
  const byType = symptoms.reduce<Record<string, number>>((acc, row) => {
    acc[row.type] = (acc[row.type] ?? 0) + 1;
    return acc;
  }, {});
  const today = new Date();
  const dayBuckets = Array.from({ length: 14 }, (_, i) => {
    const day = new Date(today);
    day.setDate(today.getDate() - (13 - i));
    const key = day.toISOString().slice(0, 10);
    return {
      key,
      label: day.toLocaleDateString(undefined, { month: "short", day: "numeric" }),
      count: 0,
    };
  });
  const dayBucketMap = new Map(dayBuckets.map((bucket) => [bucket.key, bucket]));
  symptoms.forEach((row) => {
    const bucket = dayBucketMap.get(row.date);
    if (bucket) bucket.count += 1;
  });
  const last14Values = dayBuckets.map((bucket) => bucket.count);
  const last14Labels = dayBuckets.map((bucket) => bucket.label);

  return (
    <main className="bc-page">
      <section className="space-y-5">
        <article className="bc-card space-y-3 p-6">
          <span className="bc-pill">Symptoms</span>
          <h1 className="bc-heading">Daily symptom tracking</h1>
          <p className="text-sm bc-muted">Log mood, pain, energy and other signals to identify patterns over time.</p>
          {error ? <p className="bc-alert-warn">{error.message}</p> : null}
          {params.message ? <p className="bc-alert-info">{params.message}</p> : null}
          {params.error ? <p className="bc-alert-warn">{params.error}</p> : null}
        </article>

        <div className="grid gap-4 lg:grid-cols-[0.85fr_1.15fr]">
          <article className="bc-card space-y-4 p-6">
            <h2 className="text-lg font-semibold">{editSymptom ? "Edit symptom" : "Add symptom"}</h2>
            <form action={editSymptom ? updateSymptom : addSymptom} className="space-y-3">
              {editSymptom ? <input type="hidden" name="id" value={editSymptom.id} /> : null}
              <label className="bc-label">
                <span>Date</span>
                <input
                  name="date"
                  type="date"
                  required
                  defaultValue={editSymptom?.date ?? ""}
                  className="bc-input"
                />
              </label>
              <label className="bc-label">
                <span>Category</span>
                <select name="type" className="bc-input" defaultValue={editSymptom?.type ?? "mood"}>
                  <option value="mood">Mood</option>
                  <option value="pain">Pain</option>
                  <option value="energy">Energy</option>
                  <option value="other">Other</option>
                </select>
              </label>
              <label className="bc-label">
                <span>Symptom name</span>
                <input
                  name="label"
                  required
                  placeholder="e.g. Cramps"
                  defaultValue={editSymptom?.label ?? ""}
                  className="bc-input"
                />
              </label>
              <label className="bc-label">
                <span>Intensity (1-5)</span>
                <input
                  name="intensity"
                  type="number"
                  min={1}
                  max={5}
                  defaultValue={editSymptom?.intensity ?? ""}
                  className="bc-input"
                />
              </label>
              <label className="bc-label">
                <span>Notes</span>
                <textarea
                  name="notes"
                  rows={3}
                  defaultValue={editSymptom?.metadata?.notes ?? ""}
                  className="bc-input"
                />
              </label>
              <FormSubmitButton
                pendingText={editSymptom ? "Updating symptom..." : "Saving symptom..."}
                className="bc-btn-primary w-full text-sm"
              >
                {editSymptom ? "Update symptom" : "Save symptom"}
              </FormSubmitButton>
            </form>
            {editSymptom ? (
              <Link href="/cycle/symptoms" className="block text-sm text-[var(--color-primary-700)] underline">
                Cancel editing
              </Link>
            ) : null}
            <Link href="/cycle" className="block text-sm text-[var(--color-primary-700)] underline">
              Back to cycle page
            </Link>
          </article>

          <div className="space-y-4">
            <article className="bc-card space-y-3 p-6">
              <h2 className="text-lg font-semibold">Symptom trends</h2>
              {!symptoms.length ? (
                <p className="text-sm bc-muted">No entries yet. Start with today’s log.</p>
              ) : (
                <div className="space-y-4">
                  <div className="space-y-2">
                    {Object.entries(byType).map(([type, count]) => (
                      <div key={type} className="space-y-1">
                        <div className="flex items-center justify-between text-sm">
                          <span className="capitalize">{type}</span>
                          <span className="bc-muted">{count}</span>
                        </div>
                        <div className="h-2 rounded-full bg-[var(--color-neutral-200)]">
                          <div
                            className="h-2 rounded-full bg-[var(--color-primary-500)]"
                            style={{ width: `${Math.min(100, count * 18)}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                  <div>
                    <p className="mb-2 text-sm bc-muted">Entries in last 14 days</p>
                    <SimpleBarChart values={last14Values} labels={last14Labels} barColor="#6439cc" />
                  </div>
                </div>
              )}
            </article>

            <article className="bc-card space-y-3 p-6">
              <h2 className="text-lg font-semibold">Recent entries</h2>
              {!symptoms.length ? (
                <p className="text-sm bc-muted">No symptoms logged yet.</p>
              ) : (
                <ul className="space-y-2">
                  {symptoms.map((item) => (
                    <li
                      key={item.id}
                      className="flex items-start justify-between gap-3 rounded-xl border border-[var(--color-neutral-200)] bg-white px-3 py-2"
                    >
                      <div className="text-sm">
                        <p className="font-medium">
                          {item.label} <span className="bc-muted">({item.type})</span>
                        </p>
                        <p className="bc-muted">{item.date}</p>
                        {item.intensity ? <p className="bc-muted">Intensity: {item.intensity}/5</p> : null}
                        {item.metadata?.notes ? <p className="bc-muted">{item.metadata.notes}</p> : null}
                      </div>
                      <form action={deleteSymptom}>
                        <input type="hidden" name="id" value={item.id} />
                        <div className="flex items-center gap-2">
                          <Link
                            href={`/cycle/symptoms?editSymptomId=${item.id}`}
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
          </div>
        </div>
      </section>
    </main>
  );
}
