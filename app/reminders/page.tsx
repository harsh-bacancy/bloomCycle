import Link from "next/link";
import { redirect } from "next/navigation";

import { deleteReminder, saveReminder } from "@/app/reminders/actions";
import { FormSubmitButton } from "@/components/ui/form-submit-button";
import { createClient } from "@/utils/supabase/server";

type RemindersPageProps = {
  searchParams: Promise<{ message?: string; error?: string; editId?: string }>;
};

type ReminderRow = {
  id: string;
  medication_id: string | null;
  type: "medication" | "appointment" | "custom";
  delivery_channel: "in_app" | "email" | "push" | "sms";
  active: boolean;
  schedule: { text?: string } | null;
};

type MedicationOption = { id: string; name: string };

export default async function RemindersPage({ searchParams }: RemindersPageProps) {
  const params = await searchParams;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [{ data: reminders }, { data: meds }] = await Promise.all([
    supabase
      .from("reminders")
      .select("id, medication_id, type, delivery_channel, active, schedule")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(60),
    supabase.from("medications").select("id, name").eq("user_id", user.id).order("name", { ascending: true }),
  ]);

  const reminderRows = (reminders ?? []) as ReminderRow[];
  const medicationOptions = (meds ?? []) as MedicationOption[];
  const edit = params.editId ? reminderRows.find((item) => item.id === params.editId) ?? null : null;

  return (
    <main className="bc-page">
      <section className="space-y-5">
        <article className="bc-card space-y-3 p-6">
          <span className="bc-pill">Reminders</span>
          <h1 className="bc-heading">In-app reminder settings</h1>
          <p className="text-sm bc-muted">Email/push channels are placeholders; in-app reminders are the default MVP channel.</p>
          {params.message ? <p className="bc-alert-info">{params.message}</p> : null}
          {params.error ? <p className="bc-alert-warn">{params.error}</p> : null}
        </article>

        <div className="grid gap-4 lg:grid-cols-[1fr_1fr]">
          <article className="bc-card space-y-4 p-6">
            <h2 className="text-lg font-semibold">{edit ? "Edit reminder" : "Add reminder"}</h2>
            <form action={saveReminder} className="space-y-3">
              {edit ? <input type="hidden" name="id" value={edit.id} /> : null}
              <label className="bc-label"><span>Type</span><select name="type" defaultValue={edit?.type ?? "custom"} className="bc-input"><option value="custom">Custom</option><option value="medication">Medication</option><option value="appointment">Appointment</option></select></label>
              <label className="bc-label"><span>Medication (optional)</span><select name="medication_id" defaultValue={edit?.medication_id ?? ""} className="bc-input"><option value="">None</option>{medicationOptions.map((med) => <option key={med.id} value={med.id}>{med.name}</option>)}</select></label>
              <label className="bc-label"><span>Delivery channel</span><select name="delivery_channel" defaultValue={edit?.delivery_channel ?? "in_app"} className="bc-input"><option value="in_app">In-app</option><option value="email">Email</option><option value="push">Push</option><option value="sms">SMS</option></select></label>
              <label className="bc-label"><span>Schedule text</span><input name="schedule_text" defaultValue={edit?.schedule?.text ?? ""} placeholder="Daily at 8:00 AM" className="bc-input" /></label>
              <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="active" defaultChecked={edit ? edit.active : true} /> Active</label>
              <FormSubmitButton pendingText="Saving..." className="bc-btn-primary w-full text-sm">{edit ? "Update reminder" : "Save reminder"}</FormSubmitButton>
            </form>
            {edit ? <Link href="/reminders" className="text-sm text-[var(--color-primary-700)] underline">Cancel editing</Link> : null}
          </article>

          <article className="bc-card space-y-4 p-6">
            <h2 className="text-lg font-semibold">Your reminders</h2>
            {!reminderRows.length ? <p className="text-sm bc-muted">No reminders yet.</p> : (
              <ul className="space-y-2">
                {reminderRows.map((item) => (
                  <li key={item.id} className="rounded-xl border border-[var(--color-neutral-200)] bg-white px-3 py-2 text-sm">
                    <p className="font-medium capitalize">{item.type} reminder</p>
                    <p className="bc-muted">Channel: {item.delivery_channel}</p>
                    <p className="bc-muted">Schedule: {item.schedule?.text ?? "-"}</p>
                    <p className="bc-muted">Status: {item.active ? "Active" : "Inactive"}</p>
                    <div className="mt-2 flex items-center gap-2">
                      <Link href={`/reminders?editId=${item.id}`} className="bc-btn-secondary inline-flex items-center text-sm">Edit</Link>
                      <form action={deleteReminder}><input type="hidden" name="id" value={item.id} /><FormSubmitButton pendingText="Deleting..." className="bc-btn-secondary text-sm">Delete</FormSubmitButton></form>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </article>
        </div>
      </section>
    </main>
  );
}
