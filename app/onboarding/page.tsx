import { redirect } from "next/navigation";

import { saveOnboarding } from "@/app/onboarding/actions";
import { createClient } from "@/utils/supabase/server";

type OnboardingPageProps = {
  searchParams: Promise<{ error?: string }>;
};

const steps = [
  "Basic profile",
  "Goals",
  "Cycle basics",
  "Preferences",
] as const;

export default async function OnboardingPage({ searchParams }: OnboardingPageProps) {
  const params = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("user_profiles")
    .select("id, full_name, dob, country, goal, time_zone, preferences")
    .eq("id", user.id)
    .maybeSingle();

  const profilePrefs = profile?.preferences as
    | {
        notifications?: { in_app?: boolean; email?: boolean };
        onboarding?: { last_period_date?: string | null; typical_cycle_length?: number | null };
      }
    | undefined;

  return (
    <main className="bc-page">
      <section className="mx-auto w-full max-w-4xl space-y-5 bc-card p-6 md:p-8">
        <div className="space-y-3">
          <span className="bc-pill">Onboarding</span>
          <h1 className="bc-heading">Set up your BloomCycle profile</h1>
          <p className="text-sm bc-muted">You can update these details anytime from settings.</p>
        </div>

        <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
          {steps.map((step, index) => (
            <div key={step} className="rounded-xl border border-[var(--color-primary-200)] bg-[var(--color-primary-50)] px-3 py-2 text-center text-xs font-medium text-[var(--color-primary-700)]">
              {index + 1}. {step}
            </div>
          ))}
        </div>

        {params.error ? <p className="bc-alert-warn">{params.error}</p> : null}

        <form action={saveOnboarding} className="space-y-6">
          <fieldset className="space-y-3">
            <legend className="mb-1 text-sm font-semibold">Step 1. Basic profile</legend>
            <div className="grid gap-3 md:grid-cols-2">
              <label className="bc-label">
                <span>Full name</span>
                <input name="full_name" defaultValue={profile?.full_name ?? ""} className="bc-input" />
              </label>
              <label className="bc-label">
                <span>Date of birth</span>
                <input name="dob" type="date" defaultValue={profile?.dob ?? ""} className="bc-input" />
              </label>
              <label className="bc-label">
                <span>Country</span>
                <input name="country" defaultValue={profile?.country ?? ""} className="bc-input" />
              </label>
              <label className="bc-label">
                <span>Time zone</span>
                <input name="time_zone" defaultValue={profile?.time_zone ?? "UTC"} className="bc-input" />
              </label>
            </div>
          </fieldset>

          <fieldset className="space-y-3">
            <legend className="mb-1 text-sm font-semibold">Step 2. Goal</legend>
            <label className="bc-label">
              <span>Current stage</span>
              <select name="goal" defaultValue={profile?.goal ?? "cycle_tracking"} className="bc-input">
                <option value="cycle_tracking">Cycle tracking</option>
                <option value="ttc">Trying to conceive</option>
                <option value="pregnant">Pregnant</option>
                <option value="postpartum">Postpartum</option>
              </select>
            </label>
          </fieldset>

          <fieldset className="space-y-3">
            <legend className="mb-1 text-sm font-semibold">Step 3. Cycle basics</legend>
            <div className="grid gap-3 md:grid-cols-2">
              <label className="bc-label">
                <span>Last period date (optional)</span>
                <input
                  name="last_period_date"
                  type="date"
                  defaultValue={profilePrefs?.onboarding?.last_period_date ?? ""}
                  className="bc-input"
                />
              </label>
              <label className="bc-label">
                <span>Typical cycle length (days)</span>
                <input
                  name="typical_cycle_length"
                  type="number"
                  min={20}
                  max={45}
                  defaultValue={profilePrefs?.onboarding?.typical_cycle_length ?? ""}
                  className="bc-input"
                />
              </label>
            </div>
          </fieldset>

          <fieldset className="space-y-3">
            <legend className="mb-1 text-sm font-semibold">Step 4. Preferences</legend>
            <div className="grid gap-2 rounded-xl border border-[var(--color-support-200)] bg-[var(--color-support-50)] p-4 text-sm text-[var(--color-support-600)]">
              <label className="flex items-center gap-2">
                <input type="checkbox" name="notify_in_app" defaultChecked={profilePrefs?.notifications?.in_app ?? true} />
                In-app reminders
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" name="notify_email" defaultChecked={profilePrefs?.notifications?.email ?? false} />
                Email reminders
              </label>
            </div>
          </fieldset>

          <button type="submit" className="bc-btn-primary text-sm">
            Save and continue
          </button>
        </form>
      </section>
    </main>
  );
}
