"use server";

import { redirect } from "next/navigation";

import { createClient } from "@/utils/supabase/server";

function getString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

export async function saveOnboarding(formData: FormData) {
  const fullName = getString(formData, "full_name");
  const dob = getString(formData, "dob") || null;
  const country = getString(formData, "country") || null;
  const timeZone = getString(formData, "time_zone") || "UTC";
  const goal = getString(formData, "goal") || "cycle_tracking";
  const lastPeriodDate = getString(formData, "last_period_date") || null;
  const typicalCycleLength = getString(formData, "typical_cycle_length") || null;
  const notifyInApp = getString(formData, "notify_in_app") === "on";
  const notifyEmail = getString(formData, "notify_email") === "on";

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?error=Please+login+first");
  }

  const preferences = {
    notifications: {
      in_app: notifyInApp,
      email: notifyEmail,
    },
    onboarding: {
      last_period_date: lastPeriodDate,
      typical_cycle_length: typicalCycleLength ? Number(typicalCycleLength) : null,
    },
  };

  const { error } = await supabase.from("user_profiles").upsert(
    {
      id: user.id,
      full_name: fullName,
      dob,
      country,
      time_zone: timeZone,
      goal,
      preferences,
    },
    { onConflict: "id" },
  );

  if (error) {
    if (error.code === "PGRST205" || error.message.includes("public.user_profiles")) {
      redirect(
        "/onboarding?error=Database+is+not+initialized.+Run+the+Phase+1+Supabase+migration+for+user_profiles+and+reload+schema+cache.",
      );
    }

    redirect(`/onboarding?error=${encodeURIComponent(error.message)}`);
  }

  redirect("/dashboard?message=Onboarding+saved");
}
