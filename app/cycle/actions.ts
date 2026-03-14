"use server";

import { redirect } from "next/navigation";

import { createClient } from "@/utils/supabase/server";

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

export async function addCycle(formData: FormData) {
  const cycleStartDate = getString(formData, "cycle_start_date");
  const cycleEndDate = getString(formData, "cycle_end_date") || null;
  const flowIntensity = getNumber(formData, "flow_intensity");
  const notes = getString(formData, "notes") || null;
  const averageCycleLength = getNumber(formData, "average_cycle_length");

  if (!cycleStartDate) {
    redirect("/cycle?error=Cycle+start+date+is+required");
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?error=Please+login+first");
  }

  const { error } = await supabase.from("menstrual_cycles").insert({
    user_id: user.id,
    cycle_start_date: cycleStartDate,
    cycle_end_date: cycleEndDate,
    average_cycle_length: averageCycleLength,
    flow_intensity: flowIntensity,
    notes,
  });

  if (error) {
    redirect(`/cycle?error=${encodeURIComponent(error.message)}`);
  }

  redirect("/cycle?message=Cycle+saved");
}

export async function deleteCycle(formData: FormData) {
  const id = getString(formData, "id");
  if (!id) {
    redirect("/cycle?error=Cycle+id+is+required");
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?error=Please+login+first");
  }

  const { error } = await supabase.from("menstrual_cycles").delete().eq("id", id).eq("user_id", user.id);

  if (error) {
    redirect(`/cycle?error=${encodeURIComponent(error.message)}`);
  }

  redirect("/cycle?message=Cycle+deleted");
}

export async function updateCycle(formData: FormData) {
  const id = getString(formData, "id");
  const cycleStartDate = getString(formData, "cycle_start_date");
  const cycleEndDate = getString(formData, "cycle_end_date") || null;
  const flowIntensity = getNumber(formData, "flow_intensity");
  const notes = getString(formData, "notes") || null;
  const averageCycleLength = getNumber(formData, "average_cycle_length");

  if (!id || !cycleStartDate) {
    redirect("/cycle?error=Cycle+id+and+start+date+are+required");
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?error=Please+login+first");
  }

  const { error } = await supabase
    .from("menstrual_cycles")
    .update({
      cycle_start_date: cycleStartDate,
      cycle_end_date: cycleEndDate,
      average_cycle_length: averageCycleLength,
      flow_intensity: flowIntensity,
      notes,
    })
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    redirect(`/cycle?error=${encodeURIComponent(error.message)}`);
  }

  redirect("/cycle?message=Cycle+updated");
}

export async function addSymptom(formData: FormData) {
  const date = getString(formData, "date");
  const type = getString(formData, "type") || "other";
  const label = getString(formData, "label");
  const intensity = getNumber(formData, "intensity");
  const notes = getString(formData, "notes");

  if (!date || !label) {
    redirect("/cycle/symptoms?error=Date+and+symptom+name+are+required");
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?error=Please+login+first");
  }

  const { error } = await supabase.from("symptoms").insert({
    user_id: user.id,
    date,
    type,
    label,
    intensity,
    metadata: notes ? { notes } : {},
  });

  if (error) {
    redirect(`/cycle/symptoms?error=${encodeURIComponent(error.message)}`);
  }

  redirect("/cycle/symptoms?message=Symptom+saved");
}

export async function deleteSymptom(formData: FormData) {
  const id = getString(formData, "id");
  if (!id) {
    redirect("/cycle/symptoms?error=Symptom+id+is+required");
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?error=Please+login+first");
  }

  const { error } = await supabase.from("symptoms").delete().eq("id", id).eq("user_id", user.id);

  if (error) {
    redirect(`/cycle/symptoms?error=${encodeURIComponent(error.message)}`);
  }

  redirect("/cycle/symptoms?message=Symptom+deleted");
}

export async function updateSymptom(formData: FormData) {
  const id = getString(formData, "id");
  const date = getString(formData, "date");
  const type = getString(formData, "type") || "other";
  const label = getString(formData, "label");
  const intensity = getNumber(formData, "intensity");
  const notes = getString(formData, "notes");

  if (!id || !date || !label) {
    redirect("/cycle/symptoms?error=Symptom+id,+date,+and+name+are+required");
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?error=Please+login+first");
  }

  const { error } = await supabase
    .from("symptoms")
    .update({
      date,
      type,
      label,
      intensity,
      metadata: notes ? { notes } : {},
    })
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    redirect(`/cycle/symptoms?error=${encodeURIComponent(error.message)}`);
  }

  redirect("/cycle/symptoms?message=Symptom+updated");
}
