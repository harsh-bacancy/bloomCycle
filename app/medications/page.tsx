import Link from "next/link";
import { redirect } from "next/navigation";

import { deleteMedication, saveMedication } from "@/app/medications/actions";
import { FormSubmitButton } from "@/components/ui/form-submit-button";
import { createClient } from "@/utils/supabase/server";

type MedicationsPageProps = {
  searchParams: Promise<{ message?: string; error?: string; editId?: string }>;
};

type MedicationRow = {
  id: string;
  name: string;
  dosage: string | null;
  frequency: string | null;
  route: string | null;
  start_date: string | null;
  end_date: string | null;
  type: string | null;
};

export default async function MedicationsPage({ searchParams }: MedicationsPageProps) {
  const params = await searchParams;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data } = await supabase
    .from("medications")
    .select("id, name, dosage, frequency, route, start_date, end_date, type")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(60);

  const meds = (data ?? []) as MedicationRow[];
  const edit = params.editId ? meds.find((item) => item.id === params.editId) ?? null : null;

  return (
    <main className="bc-page">
      <section className="space-y-5">
        <article className="bc-card space-y-3 p-6">
          <span className="bc-pill">Medications</span>
          <h1 className="bc-heading">Manage medications and supplements</h1>
          {params.message ? <p className="bc-alert-info">{params.message}</p> : null}
          {params.error ? <p className="bc-alert-warn">{params.error}</p> : null}
        </article>

        <div className="grid gap-4 lg:grid-cols-[1fr_1fr]">
          <article className="bc-card space-y-4 p-6">
            <h2 className="text-lg font-semibold">{edit ? "Edit item" : "Add item"}</h2>
            <form action={saveMedication} className="space-y-3">
              {edit ? <input type="hidden" name="id" value={edit.id} /> : null}
              <label className="bc-label"><span>Name</span><input name="name" defaultValue={edit?.name ?? ""} required className="bc-input" /></label>
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="bc-label"><span>Type</span><select name="type" defaultValue={edit?.type ?? "medication"} className="bc-input"><option value="medication">Medication</option><option value="supplement">Supplement</option></select></label>
                <label className="bc-label"><span>Dosage</span><input name="dosage" defaultValue={edit?.dosage ?? ""} className="bc-input" /></label>
              </div>
              <label className="bc-label"><span>Frequency</span><input name="frequency" defaultValue={edit?.frequency ?? ""} className="bc-input" /></label>
              <label className="bc-label"><span>Route</span><input name="route" defaultValue={edit?.route ?? ""} className="bc-input" /></label>
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="bc-label"><span>Start date</span><input name="start_date" type="date" defaultValue={edit?.start_date ?? ""} className="bc-input" /></label>
                <label className="bc-label"><span>End date</span><input name="end_date" type="date" defaultValue={edit?.end_date ?? ""} className="bc-input" /></label>
              </div>
              <FormSubmitButton pendingText="Saving..." className="bc-btn-primary w-full text-sm">{edit ? "Update" : "Save"}</FormSubmitButton>
            </form>
            {edit ? <Link href="/medications" className="text-sm text-[var(--color-primary-700)] underline">Cancel editing</Link> : null}
          </article>

          <article className="bc-card space-y-4 p-6">
            <h2 className="text-lg font-semibold">Your items</h2>
            {!meds.length ? <p className="text-sm bc-muted">No medications or supplements yet.</p> : (
              <ul className="space-y-2">
                {meds.map((item) => (
                  <li key={item.id} className="rounded-xl border border-[var(--color-neutral-200)] bg-white px-3 py-2 text-sm">
                    <p className="font-medium">{item.name}</p>
                    <p className="bc-muted">{item.type} {item.dosage ? `• ${item.dosage}` : ""}</p>
                    {item.frequency ? <p className="bc-muted">Frequency: {item.frequency}</p> : null}
                    <div className="mt-2 flex items-center gap-2">
                      <Link href={`/medications?editId=${item.id}`} className="bc-btn-secondary inline-flex items-center text-sm">Edit</Link>
                      <form action={deleteMedication}><input type="hidden" name="id" value={item.id} /><FormSubmitButton pendingText="Deleting..." className="bc-btn-secondary text-sm">Delete</FormSubmitButton></form>
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
