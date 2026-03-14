import Link from "next/link";
import { redirect } from "next/navigation";

import { deleteAppointment, saveAppointment } from "@/app/appointments/actions";
import { FormSubmitButton } from "@/components/ui/form-submit-button";
import { createClient } from "@/utils/supabase/server";

type AppointmentsPageProps = {
  searchParams: Promise<{ message?: string; error?: string; editId?: string }>;
};

type AppointmentRow = {
  id: string;
  title: string;
  description: string | null;
  date_time: string;
  location: string | null;
  status: "scheduled" | "completed" | "canceled";
};

export default async function AppointmentsPage({ searchParams }: AppointmentsPageProps) {
  const params = await searchParams;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data } = await supabase
    .from("appointments")
    .select("id, title, description, date_time, location, status")
    .eq("user_id", user.id)
    .order("date_time", { ascending: true })
    .limit(40);

  const appointments = (data ?? []) as AppointmentRow[];
  const edit = params.editId ? appointments.find((item) => item.id === params.editId) ?? null : null;

  return (
    <main className="bc-page">
      <section className="space-y-5">
        <article className="bc-card space-y-3 p-6">
          <span className="bc-pill">Appointments</span>
          <h1 className="bc-heading">Manage healthcare appointments</h1>
          {params.message ? <p className="bc-alert-info">{params.message}</p> : null}
          {params.error ? <p className="bc-alert-warn">{params.error}</p> : null}
        </article>

        <div className="grid gap-4 lg:grid-cols-[1fr_1fr]">
          <article className="bc-card space-y-4 p-6">
            <h2 className="text-lg font-semibold">{edit ? "Edit appointment" : "Add appointment"}</h2>
            <form action={saveAppointment} className="space-y-3">
              {edit ? <input type="hidden" name="id" value={edit.id} /> : null}
              <label className="bc-label"><span>Title</span><input name="title" defaultValue={edit?.title ?? ""} required className="bc-input" /></label>
              <label className="bc-label"><span>Date & time</span><input name="date_time" type="datetime-local" defaultValue={edit?.date_time?.slice(0, 16) ?? ""} required className="bc-input" /></label>
              <label className="bc-label"><span>Location</span><input name="location" defaultValue={edit?.location ?? ""} className="bc-input" /></label>
              <label className="bc-label"><span>Status</span><select name="status" defaultValue={edit?.status ?? "scheduled"} className="bc-input"><option value="scheduled">Scheduled</option><option value="completed">Completed</option><option value="canceled">Canceled</option></select></label>
              <label className="bc-label"><span>Description</span><textarea name="description" rows={3} defaultValue={edit?.description ?? ""} className="bc-input" /></label>
              <FormSubmitButton pendingText="Saving..." className="bc-btn-primary w-full text-sm">{edit ? "Update appointment" : "Save appointment"}</FormSubmitButton>
            </form>
            {edit ? <Link href="/appointments" className="text-sm text-[var(--color-primary-700)] underline">Cancel editing</Link> : null}
          </article>

          <article className="bc-card space-y-4 p-6">
            <h2 className="text-lg font-semibold">Upcoming / history</h2>
            {!appointments.length ? <p className="text-sm bc-muted">No appointments yet.</p> : (
              <ul className="space-y-2">
                {appointments.map((item) => (
                  <li key={item.id} className="rounded-xl border border-[var(--color-neutral-200)] bg-white px-3 py-2 text-sm">
                    <p className="font-medium">{item.title}</p>
                    <p className="bc-muted">{new Date(item.date_time).toLocaleString()}</p>
                    <p className="bc-muted">Status: {item.status}</p>
                    {item.location ? <p className="bc-muted">{item.location}</p> : null}
                    <div className="mt-2 flex items-center gap-2">
                      <Link href={`/appointments?editId=${item.id}`} className="bc-btn-secondary inline-flex items-center text-sm">Edit</Link>
                      <form action={deleteAppointment}><input type="hidden" name="id" value={item.id} /><FormSubmitButton pendingText="Deleting..." className="bc-btn-secondary text-sm">Delete</FormSubmitButton></form>
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
