import Link from "next/link";
import { notFound } from "next/navigation";

import {
  estimateReadMinutes,
  excerpt,
  formatDate,
  simpleMarkdownToHtml,
  type Article,
} from "@/lib/learn/articles";
import { createClient } from "@/utils/supabase/server";

type ArticleDetailProps = {
  params: Promise<{ slug: string }>;
};

export default async function ArticleDetailPage({ params }: ArticleDetailProps) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("articles")
    .select("id, title, slug, body, topic, stage, language, is_premium, published_at, created_at")
    .eq("slug", slug)
    .not("published_at", "is", null)
    .maybeSingle();

  if (error || !data) {
    notFound();
  }

  const article = data as Article;
  const html = simpleMarkdownToHtml(article.body);
  const readMinutes = estimateReadMinutes(article.body);

  const { data: related } = await supabase
    .from("articles")
    .select("id, title, slug, body, topic, stage, language, is_premium, published_at, created_at")
    .not("published_at", "is", null)
    .neq("id", article.id)
    .eq("topic", article.topic)
    .order("published_at", { ascending: false })
    .limit(3);

  const relatedArticles = (related ?? []) as Article[];

  return (
    <main className="bc-page">
      <article className="mx-auto w-full max-w-3xl space-y-5">
        <section className="bc-card space-y-3 p-6">
          <div className="flex flex-wrap items-center gap-2 text-xs">
            {article.topic ? <span className="rounded-full bg-[var(--color-primary-50)] px-2 py-1 capitalize">{article.topic}</span> : null}
            {article.stage ? <span className="rounded-full bg-[var(--color-support-50)] px-2 py-1 capitalize">{article.stage}</span> : null}
            <span className="rounded-full bg-[var(--color-neutral-100)] px-2 py-1">{readMinutes} min read</span>
          </div>
          <h1 className="bc-heading">{article.title}</h1>
          <p className="text-sm bc-muted">{formatDate(article.published_at)}</p>
        </section>

        <section className="bc-card p-6">
          <div
            className="prose prose-zinc max-w-none text-sm leading-7"
            dangerouslySetInnerHTML={{ __html: html }}
          />
        </section>

        <section className="bc-card space-y-3 p-6">
          <h2 className="text-lg font-semibold">Related articles</h2>
          {!relatedArticles.length ? (
            <p className="text-sm bc-muted">No related articles yet.</p>
          ) : (
            <ul className="space-y-2">
              {relatedArticles.map((item) => (
                <li key={item.id} className="rounded-xl border border-[var(--color-neutral-200)] bg-white px-3 py-2">
                  <Link href={`/learn/${item.slug}`} className="font-medium text-[var(--color-primary-700)] underline">
                    {item.title}
                  </Link>
                  <p className="text-sm bc-muted">{excerpt(item.body, 120)}</p>
                </li>
              ))}
            </ul>
          )}
          <Link href="/learn" className="text-sm text-[var(--color-primary-700)] underline">
            Back to Learn
          </Link>
        </section>
      </article>
    </main>
  );
}
