import Link from "next/link";

export default function Home() {
  return (
    <main className="bc-page">
      <section className="grid gap-4 md:grid-cols-[1.35fr_1fr]">
        <article className="bc-card space-y-6 p-6 md:p-8">
          <span className="bc-pill">Phase 1 Ready</span>
          <div className="space-y-3">
            <h1 className="bc-heading">Your private menstrual and fertility companion starts here.</h1>
            <p className="max-w-2xl text-[0.98rem] bc-muted">
              BloomCycle is set up with secure login, profile onboarding, and live Supabase connection diagnostics. The foundation is ready for cycle and pregnancy modules.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link href="/signup" className="bc-btn-primary text-sm">
              Create account
            </Link>
            <Link href="/login" className="bc-btn-secondary text-sm">
              Login
            </Link>
            <Link href="/dashboard" className="rounded-xl border border-[var(--color-neutral-300)] bg-white px-4 py-2 text-sm font-medium">
              Open dashboard
            </Link>
          </div>

          <p className="text-xs bc-muted">Non-diagnostic guidance only. For clinical concerns, consult your healthcare provider.</p>
        </article>

        <aside className="bc-card space-y-4 p-6">
          <h2 className="text-lg font-semibold">Phase 1 Scope</h2>
          <ul className="space-y-3 text-sm bc-muted">
            <li className="rounded-lg bg-[var(--color-neutral-100)] px-3 py-2">Auth: signup, login, reset password</li>
            <li className="rounded-lg bg-[var(--color-neutral-100)] px-3 py-2">Onboarding: profile, goals, cycle basics, preferences</li>
            <li className="rounded-lg bg-[var(--color-neutral-100)] px-3 py-2">Dashboard: stage-aware starter cards</li>
            <li className="rounded-lg bg-[var(--color-neutral-100)] px-3 py-2">Connection health: Supabase env and API checks</li>
          </ul>
          <Link href="/health/supabase" className="text-sm font-medium text-[var(--color-primary-700)] underline">
            Run connection check
          </Link>
        </aside>
      </section>
    </main>
  );
}
