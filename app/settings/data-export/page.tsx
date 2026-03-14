import Link from "next/link";
import { redirect } from "next/navigation";

import { createClient } from "@/utils/supabase/server";

type ExportPageProps = {
  searchParams: Promise<{ message?: string; error?: string }>;
};

type ExportRow = {
  id: string;
  requested_at: string;
  status: "pending" | "processing" | "ready" | "failed";
  export_type: string | null;
  error: string | null;
};

export default async function DataExportPage({ searchParams }: ExportPageProps) {
  const params = await searchParams;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data } = await supabase
    .from("data_exports")
    .select("id, requested_at, status, export_type, error")
    .eq("user_id", user.id)
    .order("requested_at", { ascending: false })
    .limit(30);

  const exports = (data ?? []) as ExportRow[];

  return (
    <main className="bc-page">
      <section className="space-y-5">
        <article className="bc-card space-y-3 p-6">
          <span className="bc-pill">Data Export</span>
          <h1 className="bc-heading">Export your cycle and pregnancy records</h1>
          <p className="text-sm bc-muted">Download CSV copy of your key logs for sharing or backup.</p>
          {params.message ? <p className="bc-alert-info">{params.message}</p> : null}
          {params.error ? <p className="bc-alert-warn">{params.error}</p> : null}
          <div>
            <a href="/api/export/cycle-pregnancy" className="bc-btn-primary inline-flex items-center text-sm">
              Download cycle + pregnancy CSV
            </a>
          </div>
        </article>

        <article className="bc-card space-y-4 p-6">
          <h2 className="text-lg font-semibold">Export history</h2>
          {!exports.length ? (
            <p className="text-sm bc-muted">No exports requested yet.</p>
          ) : (
            <ul className="space-y-2">
              {exports.map((item) => (
                <li key={item.id} className="rounded-xl border border-[var(--color-neutral-200)] bg-white px-3 py-2 text-sm">
                  <p className="font-medium">{item.export_type ?? "export"}</p>
                  <p className="bc-muted">Requested: {new Date(item.requested_at).toLocaleString()}</p>
                  <p className="bc-muted">Status: {item.status}</p>
                  {item.error ? <p className="text-[#8a251f]">{item.error}</p> : null}
                </li>
              ))}
            </ul>
          )}
          <div className="text-sm">
            <Link href="/dashboard" className="text-[var(--color-primary-700)] underline">Back to dashboard</Link>
          </div>
        </article>
      </section>
    </main>
  );
}
