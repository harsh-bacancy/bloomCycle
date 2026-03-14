"use server";

import { redirect } from "next/navigation";

import { normalizeSlug } from "@/lib/learn/articles";
import { createClient } from "@/utils/supabase/server";

function getString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function getBoolean(formData: FormData, key: string) {
  const value = formData.get(key);
  return value === "on" || value === "true";
}

async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?error=Please+login+first");
  }

  return { supabase, user };
}

async function resolveUniqueSlug(
  supabase: Awaited<ReturnType<typeof createClient>>,
  baseSlug: string,
  currentId?: string,
) {
  let candidate = baseSlug;
  let suffix = 2;

  for (let i = 0; i < 50; i += 1) {
    const { data, error } = await supabase
      .from("articles")
      .select("id")
      .eq("slug", candidate)
      .maybeSingle();

    if (error) {
      throw new Error(error.message);
    }

    if (!data || data.id === currentId) {
      return candidate;
    }

    candidate = `${baseSlug}-${suffix}`;
    suffix += 1;
  }

  return `${baseSlug}-${Date.now()}`;
}

export async function saveArticle(formData: FormData) {
  const id = getString(formData, "id");
  const title = getString(formData, "title");
  const body = getString(formData, "body");
  const topic = getString(formData, "topic") || null;
  const stage = getString(formData, "stage") || null;
  const language = getString(formData, "language") || "en";
  const isPremium = getBoolean(formData, "is_premium");
  const publishNow = getBoolean(formData, "publish_now");
  const slugInput = getString(formData, "slug");

  if (!title || !body) {
    redirect("/learn/admin?error=Title+and+body+are+required");
  }

  const baseSlug = normalizeSlug(slugInput || title);
  if (!baseSlug) {
    redirect("/learn/admin?error=Please+provide+a+valid+slug+or+title");
  }

  const { supabase, user } = await requireUser();
  const slug = await resolveUniqueSlug(supabase, baseSlug, id || undefined);

  const payload = {
    title,
    slug,
    body,
    topic,
    stage,
    language,
    is_premium: isPremium,
    published_at: publishNow ? new Date().toISOString() : null,
    created_by: user.id,
  };

  const result = id
    ? await supabase.from("articles").update(payload).eq("id", id).eq("created_by", user.id)
    : await supabase.from("articles").insert(payload);

  if (result.error) {
    if (result.error.code === "23505") {
      redirect("/learn/admin?error=Slug+already+exists.+Please+try+saving+again");
    }
    redirect(`/learn/admin?error=${encodeURIComponent(result.error.message)}`);
  }

  redirect("/learn/admin?message=Article+saved");
}

export async function deleteArticle(formData: FormData) {
  const id = getString(formData, "id");
  if (!id) {
    redirect("/learn/admin?error=Article+id+is+required");
  }

  const { supabase, user } = await requireUser();
  const { error } = await supabase.from("articles").delete().eq("id", id).eq("created_by", user.id);

  if (error) {
    redirect(`/learn/admin?error=${encodeURIComponent(error.message)}`);
  }

  redirect("/learn/admin?message=Article+deleted");
}
