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

export async function saveMedication(formData: FormData) {
  const id = s(formData, "id");
  const name = s(formData, "name");
  const dosage = s(formData, "dosage") || null;
  const frequency = s(formData, "frequency") || null;
  const route = s(formData, "route") || null;
  const startDate = s(formData, "start_date") || null;
  const endDate = s(formData, "end_date") || null;
  const type = s(formData, "type") || "medication";

  if (!name) redirect("/medications?error=Medication+name+is+required");

  const { supabase, user } = await getAuth();
  const payload = { user_id: user.id, name, dosage, frequency, route, start_date: startDate, end_date: endDate, type };
  const res = id
    ? await supabase.from("medications").update(payload).eq("id", id).eq("user_id", user.id)
    : await supabase.from("medications").insert(payload);

  if (res.error) redirect(`/medications?error=${encodeURIComponent(res.error.message)}`);
  redirect(`/medications?message=${id ? "Medication+updated" : "Medication+saved"}`);
}

export async function deleteMedication(formData: FormData) {
  const id = s(formData, "id");
  if (!id) redirect("/medications?error=Medication+id+is+required");
  const { supabase, user } = await getAuth();
  const { error } = await supabase.from("medications").delete().eq("id", id).eq("user_id", user.id);
  if (error) redirect(`/medications?error=${encodeURIComponent(error.message)}`);
  redirect("/medications?message=Medication+deleted");
}
