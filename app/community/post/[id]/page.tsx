import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { addComment, deleteComment, reportPost } from "@/app/community/actions";
import { FormSubmitButton } from "@/components/ui/form-submit-button";
import { createClient } from "@/utils/supabase/server";

type CommunityPostDetailProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ message?: string; error?: string }>;
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

type CommentRow = {
  id: string;
  post_id: string;
  user_id: string;
  content: string;
  created_at: string;
};

export default async function CommunityPostDetailPage({ params, searchParams }: CommunityPostDetailProps) {
  const { id } = await params;
  const q = await searchParams;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: post, error } = await supabase
    .from("community_posts")
    .select("id, user_id, category, title, content, is_anonymous, created_at")
    .eq("id", id)
    .maybeSingle();

  if (error || !post) notFound();
  const typedPost = post as PostRow;

  const [{ data: comments }, { data: flags }] = await Promise.all([
    supabase
      .from("community_comments")
      .select("id, post_id, user_id, content, created_at")
      .eq("post_id", id)
      .order("created_at", { ascending: true }),
    supabase.from("community_post_flags").select("id").eq("post_id", id),
  ]);

  const commentRows = (comments ?? []) as CommentRow[];
  const flagCount = (flags ?? []).length;

  return (
    <main className="bc-page">
      <section className="mx-auto w-full max-w-4xl space-y-5">
        <article className="bc-card space-y-3 p-6">
          <span className="bc-pill">Community Post</span>
          <h1 className="bc-heading">{typedPost.title}</h1>
          <p className="text-sm bc-muted">{typedPost.category ?? "general"} • {typedPost.is_anonymous ? "Anonymous" : "Member"} • {new Date(typedPost.created_at).toLocaleString()}</p>
          <p className="text-sm">{typedPost.content}</p>
          <p className="text-xs bc-muted">Flags: {flagCount}</p>
          {q.message ? <p className="bc-alert-info">{q.message}</p> : null}
          {q.error ? <p className="bc-alert-warn">{q.error}</p> : null}
          {typedPost.user_id !== user.id ? (
            <form action={reportPost} className="space-y-2">
              <input type="hidden" name="post_id" value={typedPost.id} />
              <label className="bc-label"><span>Report reason (optional)</span><input name="reason" className="bc-input" /></label>
              <FormSubmitButton pendingText="Reporting..." className="bc-btn-secondary text-sm">Report post</FormSubmitButton>
            </form>
          ) : null}
        </article>

        <article className="bc-card space-y-4 p-6">
          <h2 className="text-lg font-semibold">Comments</h2>
          <form action={addComment} className="space-y-3">
            <input type="hidden" name="post_id" value={typedPost.id} />
            <label className="bc-label"><span>Add comment</span><textarea name="content" rows={3} required className="bc-input" /></label>
            <FormSubmitButton pendingText="Posting..." className="bc-btn-primary text-sm">Post comment</FormSubmitButton>
          </form>

          {!commentRows.length ? <p className="text-sm bc-muted">No comments yet.</p> : (
            <ul className="space-y-2">
              {commentRows.map((comment) => (
                <li key={comment.id} className="rounded-xl border border-[var(--color-neutral-200)] bg-white px-3 py-2 text-sm">
                  <p>{comment.content}</p>
                  <p className="text-xs bc-muted">{new Date(comment.created_at).toLocaleString()}</p>
                  {comment.user_id === user.id ? (
                    <form action={deleteComment} className="mt-2">
                      <input type="hidden" name="id" value={comment.id} />
                      <input type="hidden" name="post_id" value={typedPost.id} />
                      <FormSubmitButton pendingText="Deleting..." className="bc-btn-secondary text-sm">Delete</FormSubmitButton>
                    </form>
                  ) : null}
                </li>
              ))}
            </ul>
          )}

          <Link href="/community" className="text-sm text-[var(--color-primary-700)] underline">Back to community</Link>
        </article>
      </section>
    </main>
  );
}
