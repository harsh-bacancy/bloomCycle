import Link from "next/link";
import { redirect } from "next/navigation";

import { signUp } from "@/app/auth/actions";
import { createClient } from "@/utils/supabase/server";

type SignupPageProps = {
  searchParams: Promise<{ error?: string; message?: string }>;
};

export default async function SignupPage({ searchParams }: SignupPageProps) {
  const params = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect("/dashboard");
  }

  return (
    <main className="bc-page">
      <section className="mx-auto grid w-full max-w-5xl gap-4 md:grid-cols-[1fr_1.1fr]">
        <article className="bc-card space-y-4 p-6">
          <span className="bc-pill">Start Fresh</span>
          <h1 className="bc-heading">Create account</h1>
          <p className="text-sm bc-muted">Build your profile in a few steps and get a stage-aware dashboard.</p>
          <div className="rounded-xl bg-[var(--color-primary-50)] p-4 text-sm text-[var(--color-primary-700)]">
            BloomCycle provides supportive insights and does not replace professional medical advice.
          </div>
        </article>

        <article className="bc-card space-y-4 p-6">
          {params.message ? <p className="bc-alert-info">{params.message}</p> : null}
          {params.error ? <p className="bc-alert-warn">{params.error}</p> : null}

          <form action={signUp} className="space-y-3">
            <label className="bc-label">
              <span>Email</span>
              <input name="email" type="email" required className="bc-input" />
            </label>
            <label className="bc-label">
              <span>Password</span>
              <input name="password" type="password" required minLength={6} className="bc-input" />
            </label>
            <label className="bc-label">
              <span>Confirm password</span>
              <input name="confirm_password" type="password" required minLength={6} className="bc-input" />
            </label>
            <label className="flex items-start gap-2 rounded-xl border border-[var(--color-primary-200)] bg-[var(--color-primary-50)] p-3 text-sm">
              <input type="checkbox" name="consent" value="yes" className="mt-1" required />
              <span>I understand BloomCycle is a non-diagnostic support companion.</span>
            </label>
            <button type="submit" className="bc-btn-primary w-full text-sm">
              Sign up
            </button>
          </form>

          <Link href="/login" className="block text-sm text-[var(--color-primary-700)] underline">
            Already have an account? Login
          </Link>
        </article>
      </section>
    </main>
  );
}
