import Link from "next/link";
import { redirect } from "next/navigation";

import { excerpt, stageFromGoal, type Article } from "@/lib/learn/articles";
import { signOut } from "@/app/auth/actions";
import { FormSubmitButton } from "@/components/ui/form-submit-button";
import { createClient } from "@/utils/supabase/server";

type DashboardPageProps = {
  searchParams: Promise<{ message?: string }>;
};

const stageLabels: Record<string, string> = {
  cycle_tracking: "Cycle Tracking",
  ttc: "Trying to Conceive",
  pregnant: "Pregnancy",
  postpartum: "Postpartum",
};

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  const params = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile, error: profileError } = await supabase
    .from("user_profiles")
    .select("id, full_name, goal, time_zone")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile && !profileError) {
    redirect("/onboarding");
  }

  const stage = profile?.goal ? stageLabels[profile.goal] ?? "General" : "General";
  const contentStage = stageFromGoal(profile?.goal);

  let recommended: Article[] = [];
  if (contentStage) {
    const { data: rec } = await supabase
      .from("articles")
      .select("id, title, slug, body, topic, stage, language, is_premium, published_at, created_at")
      .not("published_at", "is", null)
      .or(`stage.eq.${contentStage},topic.eq.${contentStage}`)
      .order("published_at", { ascending: false })
      .limit(3);
    recommended = (rec ?? []) as Article[];
  }

  return (
    <main className="bc-page">
      <section className="space-y-5">
        <article className="bc-card flex flex-wrap items-center justify-between gap-4 p-6">
          <div className="space-y-2">
            <span className="bc-pill">{stage}</span>
            <h1 className="bc-heading">Welcome {profile?.full_name || "there"}</h1>
            <p className="text-sm bc-muted">Your stage-aware dashboard foundation is active.</p>
          </div>
          <form action={signOut}>
            <FormSubmitButton
              pendingText="Logging out..."
              showFullScreenLoader
              className="bc-btn-secondary text-sm"
            >
              Logout
            </FormSubmitButton>
          </form>
        </article>

        {params.message ? <p className="bc-alert-info">{params.message}</p> : null}

        <div className="grid gap-4 md:grid-cols-2">
          <article className="bc-card space-y-3 p-6">
            <h2 className="text-lg font-semibold">Today overview</h2>
            <div className="bc-kv">
              <p className="bc-kv-row">
                <span className="bc-kv-key">Email:</span>
                <span className="bc-kv-val">{user.email}</span>
              </p>
              <p className="bc-kv-row">
                <span className="bc-kv-key">Time zone:</span>
                <span className="bc-kv-val">{profile?.time_zone || "Not set"}</span>
              </p>
              <p className="bc-kv-row">
                <span className="bc-kv-key">Profile:</span>
                <span className="bc-kv-val">{profile ? "Configured" : "Pending"}</span>
              </p>
            </div>
            {profileError ? <p className="text-sm text-[#8a251f]">{profileError.message}</p> : null}
          </article>

          <article className="bc-card space-y-3 p-6">
            <h2 className="text-lg font-semibold">Quick actions</h2>
            <div className="flex flex-wrap gap-2 text-sm">
              <Link href="/onboarding" className="bc-btn-secondary">Edit profile</Link>
              <Link href="/health/supabase" className="bc-btn-secondary">Verify connection</Link>
            </div>
          </article>

          <article className="bc-card space-y-2 p-6">
            <h2 className="text-lg font-semibold">Upcoming appointments</h2>
            <p className="text-sm bc-muted">Appointment and reminder management will be implemented in a later phase.</p>
          </article>

          <article className="bc-card space-y-2 p-6">
            <h2 className="text-lg font-semibold">Recommended content</h2>
            {!recommended.length ? (
              <p className="text-sm bc-muted">
                No stage-specific articles yet. Add articles from Learn admin or browse the full library.
              </p>
            ) : (
              <ul className="space-y-2">
                {recommended.map((article) => (
                  <li
                    key={article.id}
                    className="rounded-xl border border-[var(--color-neutral-200)] bg-white px-3 py-2"
                  >
                    <Link href={`/learn/${article.slug}`} className="font-medium text-[var(--color-primary-700)] underline">
                      {article.title}
                    </Link>
                    <p className="text-sm bc-muted">{excerpt(article.body, 120)}</p>
                  </li>
                ))}
              </ul>
            )}
            <div className="pt-1">
              <Link href="/learn" className="text-sm text-[var(--color-primary-700)] underline">
                Open Learn library
              </Link>
              <span className="mx-2 text-[var(--color-neutral-400)]">•</span>
              <Link href="/learn/admin" className="text-sm text-[var(--color-primary-700)] underline">
                Learn admin
              </Link>
            </div>
          </article>
        </div>
      </section>
    </main>
  );
}
