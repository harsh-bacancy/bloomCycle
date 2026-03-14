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

export async function saveAppointment(formData: FormData) {
  const id = s(formData, "id");
  const title = s(formData, "title");
  const dateTime = s(formData, "date_time");
  const description = s(formData, "description") || null;
  const location = s(formData, "location") || null;
  const status = s(formData, "status") || "scheduled";

  if (!title || !dateTime) redirect("/appointments?error=Title+and+date+time+are+required");

  const { supabase, user } = await getAuth();
  const payload = { user_id: user.id, title, date_time: dateTime, description, location, status };
  const res = id
    ? await supabase.from("appointments").update(payload).eq("id", id).eq("user_id", user.id)
    : await supabase.from("appointments").insert(payload);

  if (res.error) redirect(`/appointments?error=${encodeURIComponent(res.error.message)}`);
  redirect(`/appointments?message=${id ? "Appointment+updated" : "Appointment+saved"}`);
}

export async function deleteAppointment(formData: FormData) {
  const id = s(formData, "id");
  if (!id) redirect("/appointments?error=Appointment+id+is+required");
  const { supabase, user } = await getAuth();
  const { error } = await supabase.from("appointments").delete().eq("id", id).eq("user_id", user.id);
  if (error) redirect(`/appointments?error=${encodeURIComponent(error.message)}`);
  redirect("/appointments?message=Appointment+deleted");
}
