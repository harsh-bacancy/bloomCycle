"use server";

import { redirect } from "next/navigation";

import { createClient } from "@/utils/supabase/server";
import { dueDateFromLmp, lmpFromDueDate } from "@/lib/pregnancy/utils";

function getString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function getNumber(formData: FormData, key: string) {
  const value = getString(formData, key);
  if (!value) return null;
  const number = Number(value);
  return Number.isNaN(number) ? null : number;
}

async function getUserAndClient() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?error=Please+login+first");
  }

  return { supabase, user };
}

export async function savePregnancy(formData: FormData) {
  const id = getString(formData, "id");
  const lmpDateInput = getString(formData, "lmp_date");
  const dueDateInput = getString(formData, "estimated_due_date");
  const status = getString(formData, "status") || "ongoing";

  const lmpDate = lmpDateInput || (dueDateInput ? lmpFromDueDate(dueDateInput).toISOString().slice(0, 10) : "");
  const dueDate = dueDateInput || (lmpDate ? dueDateFromLmp(lmpDate).toISOString().slice(0, 10) : "");

  if (!lmpDate && !dueDate) {
    redirect("/pregnancy?error=Provide+LMP+date+or+due+date");
  }

  const { supabase, user } = await getUserAndClient();

  const payload = {
    user_id: user.id,
    lmp_date: lmpDate || null,
    estimated_due_date: dueDate || null,
    status,
  };

  const result = id
    ? await supabase.from("pregnancies").update(payload).eq("id", id).eq("user_id", user.id)
    : await supabase.from("pregnancies").insert(payload);

  if (result.error) {
    redirect(`/pregnancy?error=${encodeURIComponent(result.error.message)}`);
  }

  redirect(`/pregnancy?message=${id ? "Pregnancy+updated" : "Pregnancy+saved"}`);
}

export async function addPregnancyLog(formData: FormData) {
  const pregnancyId = getString(formData, "pregnancy_id");
  const weekNumber = getNumber(formData, "week_number");
  const weight = getNumber(formData, "weight");
  const notes = getString(formData, "notes");

  if (!pregnancyId || !weekNumber) {
    redirect("/pregnancy?error=Pregnancy+and+week+are+required");
  }

  const symptoms = {
    mood: getString(formData, "mood") || null,
    energy: getString(formData, "energy") || null,
    pain: getString(formData, "pain") || null,
  };

  const { supabase } = await getUserAndClient();
  const { error } = await supabase.from("pregnancy_logs").insert({
    pregnancy_id: pregnancyId,
    week_number: weekNumber,
    weight,
    notes: notes || null,
    symptoms,
  });

  if (error) {
    redirect(`/pregnancy?error=${encodeURIComponent(error.message)}`);
  }

  redirect("/pregnancy?message=Weekly+log+saved");
}

export async function addKickCount(formData: FormData) {
  const pregnancyId = getString(formData, "pregnancy_id");
  const startedAt = getString(formData, "started_at");
  const endedAt = getString(formData, "ended_at");
  const kickCount = getNumber(formData, "kick_count");

  if (!pregnancyId || !startedAt || !kickCount) {
    redirect("/pregnancy/kick-counter?error=Pregnancy,+start+time,+and+kick+count+are+required");
  }

  const { supabase } = await getUserAndClient();
  const { error } = await supabase.from("kick_counts").insert({
    pregnancy_id: pregnancyId,
    started_at: startedAt,
    ended_at: endedAt || null,
    kick_count: kickCount,
  });

  if (error) {
    redirect(`/pregnancy/kick-counter?error=${encodeURIComponent(error.message)}`);
  }

  redirect("/pregnancy/kick-counter?message=Kick+session+saved");
}

export async function addContraction(formData: FormData) {
  const pregnancyId = getString(formData, "pregnancy_id");
  const startedAt = getString(formData, "started_at");
  const endedAt = getString(formData, "ended_at");
  const durationSeconds = getNumber(formData, "duration_seconds");
  const intervalSeconds = getNumber(formData, "interval_seconds");

  if (!pregnancyId || !startedAt || !durationSeconds) {
    redirect("/pregnancy/contraction-timer?error=Pregnancy,+start+time,+and+duration+are+required");
  }

  const { supabase } = await getUserAndClient();
  const { error } = await supabase.from("contractions").insert({
    pregnancy_id: pregnancyId,
    started_at: startedAt,
    ended_at: endedAt || null,
    duration_seconds: durationSeconds,
    interval_seconds: intervalSeconds,
  });

  if (error) {
    redirect(`/pregnancy/contraction-timer?error=${encodeURIComponent(error.message)}`);
  }

  redirect("/pregnancy/contraction-timer?message=Contraction+saved");
}
