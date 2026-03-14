import Link from "next/link";
import { redirect } from "next/navigation";

import { deleteArticle, saveArticle } from "@/app/learn/actions";
import { FormSubmitButton } from "@/components/ui/form-submit-button";
import { TOPICS, formatDate, type Article } from "@/lib/learn/articles";
import { createClient } from "@/utils/supabase/server";

type LearnAdminPageProps = {
  searchParams: Promise<{ error?: string; message?: string; editId?: string }>;
};

export default async function LearnAdminPage({ searchParams }: LearnAdminPageProps) {
  const params = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data, error } = await supabase
    .from("articles")
    .select("id, title, slug, body, topic, stage, language, is_premium, published_at, created_at, created_by")
    .eq("created_by", user.id)
    .order("created_at", { ascending: false })
    .limit(40);

  const articles = (data ?? []) as Article[];
  const editArticle = params.editId ? articles.find((item) => item.id === params.editId) ?? null : null;

  return (
    <main className="bc-page">
      <section className="space-y-5">
        <article className="bc-card space-y-3 p-6">
          <span className="bc-pill">Learn Admin</span>
          <h1 className="bc-heading">Manage article library</h1>
          <p className="text-sm bc-muted">Minimal admin interface for creating and updating educational content.</p>
          {error ? <p className="bc-alert-warn">{error.message}</p> : null}
          {params.message ? <p className="bc-alert-info">{params.message}</p> : null}
          {params.error ? <p className="bc-alert-warn">{params.error}</p> : null}
        </article>

        <div className="grid gap-4 lg:grid-cols-[1fr_1fr]">
          <article className="bc-card space-y-4 p-6">
            <h2 className="text-lg font-semibold">{editArticle ? "Edit article" : "New article"}</h2>
            <form action={saveArticle} className="space-y-3">
              {editArticle ? <input type="hidden" name="id" value={editArticle.id} /> : null}
              <label className="bc-label">
                <span>Title</span>
                <input name="title" defaultValue={editArticle?.title ?? ""} required className="bc-input" />
              </label>
              <label className="bc-label">
                <span>Slug (optional)</span>
                <input name="slug" defaultValue={editArticle?.slug ?? ""} placeholder="auto-from-title" className="bc-input" />
              </label>
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="bc-label">
                  <span>Topic</span>
                  <select name="topic" defaultValue={editArticle?.topic ?? ""} className="bc-input">
                    <option value="">None</option>
                    {TOPICS.map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="bc-label">
                  <span>Stage</span>
                  <select name="stage" defaultValue={editArticle?.stage ?? ""} className="bc-input">
                    <option value="">None</option>
                    <option value="cycle">Cycle</option>
                    <option value="ttc">TTC</option>
                    <option value="pregnancy">Pregnancy</option>
                    <option value="postpartum">Postpartum</option>
                    <option value="baby">Baby</option>
                  </select>
                </label>
              </div>
              <label className="bc-label">
                <span>Language</span>
                <input name="language" defaultValue={editArticle?.language ?? "en"} className="bc-input" />
              </label>
              <label className="bc-label">
                <span>Body (Markdown)</span>
                <textarea name="body" rows={10} defaultValue={editArticle?.body ?? ""} required className="bc-input" />
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" name="is_premium" defaultChecked={Boolean(editArticle?.is_premium)} />
                Premium article
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" name="publish_now" defaultChecked={Boolean(editArticle?.published_at)} />
                Publish now
              </label>
              <FormSubmitButton pendingText="Saving..." className="bc-btn-primary w-full text-sm">
                {editArticle ? "Update article" : "Save article"}
              </FormSubmitButton>
            </form>
            {editArticle ? (
              <Link href="/learn/admin" className="text-sm text-[var(--color-primary-700)] underline">
                Cancel editing
              </Link>
            ) : null}
          </article>

          <article className="bc-card space-y-4 p-6">
            <h2 className="text-lg font-semibold">Your articles</h2>
            {!articles.length ? (
              <p className="text-sm bc-muted">No articles yet.</p>
            ) : (
              <ul className="space-y-2">
                {articles.map((article) => (
                  <li key={article.id} className="rounded-xl border border-[var(--color-neutral-200)] bg-white px-3 py-2 text-sm">
                    <p className="font-medium">{article.title}</p>
                    <p className="bc-muted">/{article.slug}</p>
                    <p className="bc-muted">{formatDate(article.published_at)}</p>
                    <div className="mt-2 flex items-center gap-2">
                      <Link href={`/learn/admin?editId=${article.id}`} className="bc-btn-secondary inline-flex items-center text-sm">
                        Edit
                      </Link>
                      <form action={deleteArticle}>
                        <input type="hidden" name="id" value={article.id} />
                        <FormSubmitButton pendingText="Deleting..." className="bc-btn-secondary text-sm">
                          Delete
                        </FormSubmitButton>
                      </form>
                      <Link href={`/learn/${article.slug}`} className="text-[var(--color-primary-700)] underline">
                        View
                      </Link>
                    </div>
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
