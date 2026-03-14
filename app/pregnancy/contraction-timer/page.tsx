import Link from "next/link";
import { redirect } from "next/navigation";

import { addContraction } from "@/app/pregnancy/actions";
import { FormSubmitButton } from "@/components/ui/form-submit-button";
import { createClient } from "@/utils/supabase/server";
import { formatDate } from "@/lib/pregnancy/utils";

type ContractionPageProps = {
  searchParams: Promise<{ error?: string; message?: string }>;
};

type ContractionRow = {
  id: string;
  started_at: string;
  ended_at: string | null;
  duration_seconds: number | null;
  interval_seconds: number | null;
};

function formatDuration(seconds: number | null) {
  if (!seconds) return "-";
  const min = Math.floor(seconds / 60);
  const sec = seconds % 60;
  return `${min}m ${sec}s`;
}

export default async function ContractionTimerPage({ searchParams }: ContractionPageProps) {
  const params = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: pregnancies } = await supabase
    .from("pregnancies")
    .select("id")
    .eq("user_id", user.id)
    .eq("status", "ongoing")
    .order("created_at", { ascending: false })
    .limit(1);

  const pregnancy = (pregnancies ?? [])[0] as { id: string } | undefined;

  const { data: contractions, error } = pregnancy
    ? await supabase
        .from("contractions")
        .select("id, started_at, ended_at, duration_seconds, interval_seconds")
        .eq("pregnancy_id", pregnancy.id)
        .order("started_at", { ascending: false })
        .limit(20)
    : { data: [] as ContractionRow[], error: null };

  return (
    <main className="bc-page">
      <section className="space-y-5">
        <article className="bc-card space-y-3 p-6">
          <span className="bc-pill">Contraction Timer</span>
          <h1 className="bc-heading">Track contraction timing</h1>
          <p className="text-sm bc-muted">
            This tool is for personal logging and does not provide diagnosis or emergency recommendations.
          </p>
          {error ? <p className="bc-alert-warn">{error.message}</p> : null}
          {params.message ? <p className="bc-alert-info">{params.message}</p> : null}
          {params.error ? <p className="bc-alert-warn">{params.error}</p> : null}
        </article>

        <div className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
          <article className="bc-card space-y-4 p-6">
            <h2 className="text-lg font-semibold">Log contraction</h2>
            {!pregnancy ? (
              <p className="text-sm bc-muted">Create an ongoing pregnancy first.</p>
            ) : (
              <form action={addContraction} className="space-y-3">
                <input type="hidden" name="pregnancy_id" value={pregnancy.id} />
                <label className="bc-label">
                  <span>Start time</span>
                  <input name="started_at" type="datetime-local" required className="bc-input" />
                </label>
                <label className="bc-label">
                  <span>End time</span>
                  <input name="ended_at" type="datetime-local" className="bc-input" />
                </label>
                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="bc-label">
                    <span>Duration (seconds)</span>
                    <input name="duration_seconds" type="number" min={1} required className="bc-input" />
                  </label>
                  <label className="bc-label">
                    <span>Interval (seconds)</span>
                    <input name="interval_seconds" type="number" min={0} className="bc-input" />
                  </label>
                </div>
                <FormSubmitButton pendingText="Saving..." className="bc-btn-primary w-full text-sm">
                  Save contraction
                </FormSubmitButton>
              </form>
            )}
            <Link href="/pregnancy" className="block text-sm text-[var(--color-primary-700)] underline">
              Back to pregnancy overview
            </Link>
          </article>

          <article className="bc-card space-y-4 p-6">
            <h2 className="text-lg font-semibold">Recent contractions</h2>
            {!contractions?.length ? (
              <p className="text-sm bc-muted">No contractions logged yet.</p>
            ) : (
              <ul className="space-y-2">
                {(contractions as ContractionRow[]).map((item) => (
                  <li key={item.id} className="rounded-xl border border-[var(--color-neutral-200)] bg-white px-3 py-2 text-sm">
                    <p className="font-medium">Start: {formatDate(item.started_at)}</p>
                    <p className="bc-muted">Duration: {formatDuration(item.duration_seconds)}</p>
                    <p className="bc-muted">Interval: {formatDuration(item.interval_seconds)}</p>
                    {item.ended_at ? <p className="bc-muted">End: {formatDate(item.ended_at)}</p> : null}
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
