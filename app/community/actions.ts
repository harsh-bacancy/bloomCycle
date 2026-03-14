"use server";

import { redirect } from "next/navigation";

import { createClient } from "@/utils/supabase/server";

function s(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

async function auth() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?error=Please+login+first");
  return { supabase, user };
}

export async function savePost(formData: FormData) {
  const id = s(formData, "id");
  const category = s(formData, "category") || null;
  const title = s(formData, "title");
  const content = s(formData, "content");
  const isAnonymous = s(formData, "is_anonymous") === "on";

  if (!title || !content) {
    redirect("/community?error=Title+and+content+are+required");
  }

  const { supabase, user } = await auth();
  const payload = {
    user_id: user.id,
    category,
    title,
    content,
    is_anonymous: isAnonymous,
  };

  const res = id
    ? await supabase.from("community_posts").update(payload).eq("id", id).eq("user_id", user.id)
    : await supabase.from("community_posts").insert(payload);

  if (res.error) {
    redirect(`/community?error=${encodeURIComponent(res.error.message)}`);
  }

  redirect(`/community?message=${id ? "Post+updated" : "Post+published"}`);
}

export async function deletePost(formData: FormData) {
  const id = s(formData, "id");
  if (!id) redirect("/community?error=Post+id+is+required");

  const { supabase, user } = await auth();
  const { error } = await supabase.from("community_posts").delete().eq("id", id).eq("user_id", user.id);

  if (error) redirect(`/community?error=${encodeURIComponent(error.message)}`);
  redirect("/community?message=Post+deleted");
}

export async function addComment(formData: FormData) {
  const postId = s(formData, "post_id");
  const content = s(formData, "content");
  if (!postId || !content) {
    redirect(`/community/post/${postId || ""}?error=Comment+content+is+required`);
  }

  const { supabase, user } = await auth();
  const { error } = await supabase.from("community_comments").insert({
    post_id: postId,
    user_id: user.id,
    content,
  });

  if (error) redirect(`/community/post/${postId}?error=${encodeURIComponent(error.message)}`);
  redirect(`/community/post/${postId}?message=Comment+added`);
}

export async function deleteComment(formData: FormData) {
  const id = s(formData, "id");
  const postId = s(formData, "post_id");
  if (!id || !postId) redirect("/community?error=Comment+id+is+required");

  const { supabase, user } = await auth();
  const { error } = await supabase
    .from("community_comments")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) redirect(`/community/post/${postId}?error=${encodeURIComponent(error.message)}`);
  redirect(`/community/post/${postId}?message=Comment+deleted`);
}

export async function reportPost(formData: FormData) {
  const postId = s(formData, "post_id");
  const reason = s(formData, "reason") || null;

  if (!postId) redirect("/community?error=Post+id+is+required");

  const { supabase, user } = await auth();
  const { error } = await supabase.from("community_post_flags").upsert(
    {
      post_id: postId,
      user_id: user.id,
      reason,
    },
    { onConflict: "post_id,user_id" },
  );

  if (error) redirect(`/community/post/${postId}?error=${encodeURIComponent(error.message)}`);
  redirect(`/community/post/${postId}?message=Post+reported`);
}
