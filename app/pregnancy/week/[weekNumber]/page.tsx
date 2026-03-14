import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { createClient } from "@/utils/supabase/server";
import { formatDate, weekRangeFromLmp, weekTip } from "@/lib/pregnancy/utils";

type WeekDetailProps = {
  params: Promise<{ weekNumber: string }>;
};

export default async function WeekDetailPage({ params }: WeekDetailProps) {
  const { weekNumber } = await params;
  const parsedWeek = Number(weekNumber);
  if (Number.isNaN(parsedWeek) || parsedWeek < 1 || parsedWeek > 40) {
    notFound();
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: pregnancies } = await supabase
    .from("pregnancies")
    .select("id, lmp_date")
    .eq("user_id", user.id)
    .eq("status", "ongoing")
    .order("created_at", { ascending: false })
    .limit(1);

  const pregnancy = (pregnancies ?? [])[0] as { id: string; lmp_date: string | null } | undefined;
  if (!pregnancy?.lmp_date) {
    redirect("/pregnancy?error=Please+set+your+pregnancy+dates+first");
  }

  const range = weekRangeFromLmp(pregnancy.lmp_date, parsedWeek);
  const tip = weekTip(range.clampedWeek);

  return (
    <main className="bc-page">
      <section className="mx-auto w-full max-w-4xl space-y-5">
        <article className="bc-card space-y-3 p-6">
          <span className="bc-pill">Weekly Details</span>
          <h1 className="bc-heading">Week {range.clampedWeek}</h1>
          <p className="text-sm bc-muted">
            {formatDate(range.start)} to {formatDate(range.end)}
          </p>
        </article>

        <div className="grid gap-4 md:grid-cols-2">
          <article className="bc-card space-y-3 p-6">
            <h2 className="text-lg font-semibold">Baby development</h2>
            <p className="text-sm bc-muted">
              Development pace varies. Use this section as supportive education, not diagnosis.
            </p>
            <ul className="list-disc space-y-1 pl-5 text-sm bc-muted">
              <li>Track overall comfort and routine changes.</li>
              <li>Stay consistent with prenatal appointments.</li>
              <li>Log symptoms to discuss with your clinician when needed.</li>
            </ul>
          </article>

          <article className="bc-card space-y-3 p-6">
            <h2 className="text-lg font-semibold">Maternal changes</h2>
            <p className="rounded-xl bg-[var(--color-support-50)] px-3 py-2 text-sm text-[var(--color-support-600)]">
              {tip}
            </p>
            <p className="text-sm bc-muted">
              If symptoms feel severe, persistent, or concerning, contact your healthcare provider.
            </p>
          </article>
        </div>

        <div className="flex gap-4 text-sm">
          <Link href="/pregnancy" className="text-[var(--color-primary-700)] underline">
            Back to pregnancy overview
          </Link>
        </div>
      </section>
    </main>
  );
}
