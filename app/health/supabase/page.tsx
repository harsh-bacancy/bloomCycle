import Link from "next/link";

import { createClient } from "@/utils/supabase/server";

export default async function SupabaseHealthPage() {
  const supabase = await createClient();
  const authCheck = await supabase.auth.getSession();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let profileCheck:
    | { ok: true; message: string }
    | { ok: false; message: string }
    | { ok: null; message: string } = {
    ok: null,
    message: "Login required for user_profiles check.",
  };

  if (user) {
    const { error } = await supabase.from("user_profiles").select("id").limit(1);
    profileCheck = error
      ? { ok: false, message: error.message }
      : { ok: true, message: "Query to user_profiles succeeded." };
  }

  const statusChip = profileCheck.ok === true ? "PASS" : profileCheck.ok === false ? "FAIL" : "INFO";

  return (
    <main className="bc-page">
      <section className="mx-auto w-full max-w-4xl space-y-5 bc-card p-6">
        <div className="space-y-2">
          <span className="bc-pill">System Health</span>
          <h1 className="bc-heading">Supabase connection status</h1>
          <p className="text-sm bc-muted">Confirms environment keys, auth API access, and profile table availability.</p>
        </div>

        <div className="bc-kv rounded-xl border border-[var(--color-neutral-200)] bg-[var(--color-neutral-100)] p-4">
          <p className="bc-kv-row">
            <span className="bc-kv-key">SUPABASE URL configured:</span>
            <span className="bc-kv-val">{process.env.NEXT_PUBLIC_SUPABASE_URL ? "Yes" : "No"}</span>
          </p>
          <p className="bc-kv-row">
            <span className="bc-kv-key">SUPABASE anon key configured:</span>
            <span className="bc-kv-val">
              {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "Yes" : "No"}
            </span>
          </p>
          <p className="bc-kv-row">
            <span className="bc-kv-key">Auth API reachable:</span>
            <span className="bc-kv-val">{authCheck.error ? "No" : "Yes"}</span>
          </p>
          <p className="bc-kv-row">
            <span className="bc-kv-key">Logged-in user:</span>
            <span className="bc-kv-val">{user ? "Yes" : "No"}</span>
          </p>
          <p className="bc-kv-row">
            <span className="bc-kv-key">user_profiles check:</span>
            <span className="bc-kv-val">{statusChip}</span>
          </p>
        </div>

        <p className={profileCheck.ok === false ? "bc-alert-warn" : "bc-alert-info"}>{profileCheck.message}</p>

        <div className="flex gap-4 text-sm">
          <Link href="/login" className="text-[var(--color-primary-700)] underline">
            Go to login
          </Link>
          <a href="/api/supabase/ping" className="text-[var(--color-primary-700)] underline">
            Open JSON endpoint
          </a>
        </div>
      </section>
    </main>
  );
}
