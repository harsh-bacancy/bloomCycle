import Link from "next/link";

import { excerpt, formatDate, stageFromGoal, TOPICS, type Article } from "@/lib/learn/articles";
import { createClient } from "@/utils/supabase/server";

type LearnPageProps = {
  searchParams: Promise<{ topic?: string; stage?: string; q?: string }>;
};

export default async function LearnPage({ searchParams }: LearnPageProps) {
  const params = await searchParams;
  const topic = params.topic || "";
  const stage = params.stage || "";
  const q = params.q?.trim() || "";

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let goalStage = "";
  if (user) {
    const { data: profile } = await supabase
      .from("user_profiles")
      .select("goal")
      .eq("id", user.id)
      .maybeSingle();
    goalStage = stageFromGoal(profile?.goal) ?? "";
  }

  let query = supabase
    .from("articles")
    .select("id, title, slug, body, topic, stage, language, is_premium, published_at, created_at")
    .not("published_at", "is", null)
    .order("published_at", { ascending: false })
    .limit(60);

  if (topic) query = query.eq("topic", topic);
  if (stage) query = query.eq("stage", stage);
  if (q) query = query.ilike("title", `%${q}%`);

  const { data, error } = await query;
  const articles = (data ?? []) as Article[];

  const stageFilter = stage || goalStage;

  return (
    <main className="bc-page">
      <section className="space-y-5">
        <article className="bc-card space-y-3 p-6">
          <span className="bc-pill">Learn</span>
          <h1 className="bc-heading">Educational content library</h1>
          <p className="text-sm bc-muted">Explore supportive, non-diagnostic content based on your stage and interests.</p>
          {user ? (
            <div>
              <Link href="/learn/admin" className="bc-btn-primary inline-flex items-center text-sm">
                Add article
              </Link>
            </div>
          ) : null}
          {error ? <p className="bc-alert-warn">{error.message}</p> : null}
        </article>

        <article className="bc-card space-y-4 p-6">
          <h2 className="text-lg font-semibold">Filters</h2>
          <form className="grid gap-3 sm:grid-cols-4" method="get">
            <label className="bc-label">
              <span>Topic</span>
              <select name="topic" defaultValue={topic} className="bc-input">
                <option value="">All</option>
                {TOPICS.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </label>
            <label className="bc-label">
              <span>Stage</span>
              <select name="stage" defaultValue={stageFilter} className="bc-input">
                <option value="">All</option>
                <option value="cycle">Cycle</option>
                <option value="ttc">TTC</option>
                <option value="pregnancy">Pregnancy</option>
                <option value="postpartum">Postpartum</option>
                <option value="baby">Baby</option>
              </select>
            </label>
            <label className="bc-label sm:col-span-2">
              <span>Search title</span>
              <input name="q" defaultValue={q} className="bc-input" placeholder="Search articles" />
            </label>
            <div className="sm:col-span-4">
              <button type="submit" className="bc-btn-primary text-sm">
                Apply filters
              </button>
            </div>
          </form>
        </article>

        {!articles.length ? (
          <article className="bc-card p-6 text-sm bc-muted">No articles found for the current filters.</article>
        ) : (
          <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {articles.map((article) => (
              <article key={article.id} className="bc-card flex flex-col justify-between gap-4 p-5">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs">
                    {article.topic ? (
                      <span className="rounded-full bg-[var(--color-primary-50)] px-2 py-1 capitalize">
                        {article.topic}
                      </span>
                    ) : null}
                    {article.stage ? (
                      <span className="rounded-full bg-[var(--color-support-50)] px-2 py-1 capitalize">
                        {article.stage}
                      </span>
                    ) : null}
                  </div>
                  <h3 className="text-lg font-semibold">{article.title}</h3>
                  <p className="text-sm bc-muted">{excerpt(article.body, 145)}</p>
                </div>
                <div className="flex items-center justify-between text-xs bc-muted">
                  <span>{formatDate(article.published_at)}</span>
                  <Link href={`/learn/${article.slug}`} className="text-[var(--color-primary-700)] underline">
                    Read
                  </Link>
                </div>
              </article>
            ))}
          </section>
        )}
      </section>
    </main>
  );
}
