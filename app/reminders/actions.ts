"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";

function s(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

async function getAuth() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?error=Please+login+first");
  return { supabase, user };
}

export async function saveReminder(formData: FormData) {
  const id = s(formData, "id");
  const medicationId = s(formData, "medication_id") || null;
  const type = s(formData, "type") || "custom";
  const deliveryChannel = s(formData, "delivery_channel") || "in_app";
  const scheduleText = s(formData, "schedule_text") || "";
  const active = s(formData, "active") === "on";

  const { supabase, user } = await getAuth();
  const payload = {
    user_id: user.id,
    medication_id: medicationId,
    type,
    delivery_channel: deliveryChannel,
    schedule: { text: scheduleText },
    active,
  };

  const res = id
    ? await supabase.from("reminders").update(payload).eq("id", id).eq("user_id", user.id)
    : await supabase.from("reminders").insert(payload);

  if (res.error) redirect(`/reminders?error=${encodeURIComponent(res.error.message)}`);
  redirect(`/reminders?message=${id ? "Reminder+updated" : "Reminder+saved"}`);
}

export async function deleteReminder(formData: FormData) {
  const id = s(formData, "id");
  if (!id) redirect("/reminders?error=Reminder+id+is+required");
  const { supabase, user } = await getAuth();
  const { error } = await supabase.from("reminders").delete().eq("id", id).eq("user_id", user.id);
  if (error) redirect(`/reminders?error=${encodeURIComponent(error.message)}`);
  redirect("/reminders?message=Reminder+deleted");
}
