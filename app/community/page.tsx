import Link from "next/link";
import { redirect } from "next/navigation";

import { deletePost, savePost } from "@/app/community/actions";
import { CategoryFilter } from "@/components/community/category-filter";
import { FormSubmitButton } from "@/components/ui/form-submit-button";
import { createClient } from "@/utils/supabase/server";

type CommunityPageProps = {
  searchParams: Promise<{ category?: string; message?: string; error?: string; editId?: string }>;
};

type PostRow = {
  id: string;
  user_id: string;
  category: string | null;
  title: string;
  content: string;
  is_anonymous: boolean;
  created_at: string;
};

const categories = ["ttc", "trimester_1", "trimester_2", "trimester_3", "postpartum", "parenting"];

export default async function CommunityPage({ searchParams }: CommunityPageProps) {
  const params = await searchParams;
  const category = params.category || "";

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  let postQuery = supabase
    .from("community_posts")
    .select("id, user_id, category, title, content, is_anonymous, created_at")
    .order("created_at", { ascending: false })
    .limit(50);

  if (category) {
    postQuery = postQuery.eq("category", category);
  }

  const { data: posts, error } = await postQuery;
  const postRows = (posts ?? []) as PostRow[];
  const editPost = params.editId ? postRows.find((item) => item.id === params.editId) ?? null : null;

  const postIds = postRows.map((item) => item.id);
  const [{ data: comments }, { data: flags }] = postIds.length
    ? await Promise.all([
        supabase.from("community_comments").select("id, post_id").in("post_id", postIds),
        supabase.from("community_post_flags").select("id, post_id").in("post_id", postIds),
      ])
    : [{ data: [] }, { data: [] }];

  const commentCount = (comments ?? []).reduce<Record<string, number>>((acc, item) => {
    const key = item.post_id as string;
    acc[key] = (acc[key] ?? 0) + 1;
    return acc;
  }, {});

  const flagCount = (flags ?? []).reduce<Record<string, number>>((acc, item) => {
    const key = item.post_id as string;
    acc[key] = (acc[key] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <main className="bc-page">
      <section className="space-y-5">
        <article className="bc-card space-y-3 p-6">
          <span className="bc-pill">Community</span>
          <h1 className="bc-heading">Connect with others in similar stages</h1>
          <p className="text-sm bc-muted">Keep discussions respectful. This is peer support, not medical advice.</p>
          {error ? <p className="bc-alert-warn">{error.message}</p> : null}
          {params.message ? <p className="bc-alert-info">{params.message}</p> : null}
          {params.error ? <p className="bc-alert-warn">{params.error}</p> : null}
        </article>

        <article className="bc-card space-y-4 p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-lg font-semibold">{editPost ? "Edit post" : "Create post"}</h2>
          </div>

          <form action={savePost} className="space-y-3">
            {editPost ? <input type="hidden" name="id" value={editPost.id} /> : null}
            <div className="grid gap-3 sm:grid-cols-[0.35fr_0.65fr]">
              <label className="bc-label">
                <span>Category</span>
                <select name="category" defaultValue={editPost?.category ?? ""} className="bc-input">
                  <option value="">None</option>
                  {categories.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </label>
              <label className="bc-label">
                <span>Title</span>
                <input name="title" defaultValue={editPost?.title ?? ""} required className="bc-input" />
              </label>
            </div>
            <label className="bc-label">
              <span>Content</span>
              <textarea
                name="content"
                rows={3}
                defaultValue={editPost?.content ?? ""}
                required
                className="bc-input"
              />
            </label>
            <div className="flex items-center justify-between gap-3">
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" name="is_anonymous" defaultChecked={Boolean(editPost?.is_anonymous)} />
                Post anonymously
              </label>
              <div className="flex items-center gap-2">
                {editPost ? (
                  <Link href="/community" className="text-sm text-[var(--color-primary-700)] underline">
                    Cancel
                  </Link>
                ) : null}
                <FormSubmitButton pendingText="Posting..." className="bc-btn-primary px-4 py-2 text-sm">
                  {editPost ? "Update post" : "Post"}
                </FormSubmitButton>
              </div>
            </div>
          </form>
        </article>

        <article className="bc-card space-y-4 p-6">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <h2 className="text-lg font-semibold">Posts feed</h2>
            <CategoryFilter categories={categories} value={category} />
          </div>
          {!postRows.length ? (
            <p className="text-sm bc-muted">No posts yet.</p>
          ) : (
            <ul className="space-y-3">
              {postRows.map((post) => (
                <li
                  key={post.id}
                  className="rounded-xl border border-[var(--color-neutral-200)] bg-white px-4 py-3 text-sm"
                >
                  <p className="font-medium">{post.title}</p>
                  <p className="bc-muted">
                    {post.category ?? "general"} • {post.is_anonymous ? "Anonymous" : "Member"} •{" "}
                    {new Date(post.created_at).toLocaleString()}
                  </p>
                  <p className="mt-1 text-[var(--color-neutral-700)]">{post.content}</p>
                  <p className="mt-1 text-xs bc-muted">
                    Comments: {commentCount[post.id] ?? 0} • Flags: {flagCount[post.id] ?? 0}
                  </p>
                  <div className="mt-2 flex items-center gap-2">
                    <Link href={`/community/post/${post.id}`} className="text-[var(--color-primary-700)] underline">
                      Open
                    </Link>
                    {post.user_id === user.id ? (
                      <>
                        <Link
                          href={`/community?editId=${post.id}`}
                          className="bc-btn-secondary inline-flex items-center text-sm"
                        >
                          Edit
                        </Link>
                        <form action={deletePost}>
                          <input type="hidden" name="id" value={post.id} />
                          <FormSubmitButton pendingText="Deleting..." className="bc-btn-secondary text-sm">
                            Delete
                          </FormSubmitButton>
                        </form>
                      </>
                    ) : null}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </article>
      </section>
    </main>
  );
}
