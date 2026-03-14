import Link from "next/link";
import { redirect } from "next/navigation";

import { addKickCount } from "@/app/pregnancy/actions";
import { FormSubmitButton } from "@/components/ui/form-submit-button";
import { createClient } from "@/utils/supabase/server";
import { formatDate } from "@/lib/pregnancy/utils";

type KickCounterPageProps = {
  searchParams: Promise<{ error?: string; message?: string }>;
};

type KickRow = {
  id: string;
  started_at: string;
  ended_at: string | null;
  kick_count: number | null;
  created_at: string;
};

export default async function KickCounterPage({ searchParams }: KickCounterPageProps) {
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

  const { data: sessions, error } = pregnancy
    ? await supabase
        .from("kick_counts")
        .select("id, started_at, ended_at, kick_count, created_at")
        .eq("pregnancy_id", pregnancy.id)
        .order("started_at", { ascending: false })
        .limit(20)
    : { data: [] as KickRow[], error: null };

  return (
    <main className="bc-page">
      <section className="space-y-5">
        <article className="bc-card space-y-3 p-6">
          <span className="bc-pill">Kick Counter</span>
          <h1 className="bc-heading">Track fetal movement sessions</h1>
          <p className="text-sm bc-muted">Use this as a personal log. For urgent concerns, contact your care provider.</p>
          {error ? <p className="bc-alert-warn">{error.message}</p> : null}
          {params.message ? <p className="bc-alert-info">{params.message}</p> : null}
          {params.error ? <p className="bc-alert-warn">{params.error}</p> : null}
        </article>

        <div className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
          <article className="bc-card space-y-4 p-6">
            <h2 className="text-lg font-semibold">Log session</h2>
            {!pregnancy ? (
              <p className="text-sm bc-muted">Create an ongoing pregnancy first.</p>
            ) : (
              <form action={addKickCount} className="space-y-3">
                <input type="hidden" name="pregnancy_id" value={pregnancy.id} />
                <label className="bc-label">
                  <span>Session start</span>
                  <input name="started_at" type="datetime-local" required className="bc-input" />
                </label>
                <label className="bc-label">
                  <span>Session end</span>
                  <input name="ended_at" type="datetime-local" className="bc-input" />
                </label>
                <label className="bc-label">
                  <span>Kick count</span>
                  <input name="kick_count" type="number" min={1} max={200} required className="bc-input" />
                </label>
                <FormSubmitButton pendingText="Saving..." className="bc-btn-primary w-full text-sm">
                  Save kick session
                </FormSubmitButton>
              </form>
            )}
            <Link href="/pregnancy" className="block text-sm text-[var(--color-primary-700)] underline">
              Back to pregnancy overview
            </Link>
          </article>

          <article className="bc-card space-y-4 p-6">
            <h2 className="text-lg font-semibold">Recent sessions</h2>
            {!sessions?.length ? (
              <p className="text-sm bc-muted">No kick sessions saved yet.</p>
            ) : (
              <ul className="space-y-2">
                {(sessions as KickRow[]).map((session) => (
                  <li key={session.id} className="rounded-xl border border-[var(--color-neutral-200)] bg-white px-3 py-2 text-sm">
                    <p className="font-medium">{session.kick_count ?? 0} kicks</p>
                    <p className="bc-muted">Start: {formatDate(session.started_at)}</p>
                    {session.ended_at ? <p className="bc-muted">End: {formatDate(session.ended_at)}</p> : null}
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
