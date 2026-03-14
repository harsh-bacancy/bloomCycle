import Link from "next/link";
import { redirect } from "next/navigation";

import { signIn } from "@/app/auth/actions";
import { FormSubmitButton } from "@/components/ui/form-submit-button";
import { createClient } from "@/utils/supabase/server";

type LoginPageProps = {
  searchParams: Promise<{ error?: string; message?: string }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
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
          <span className="bc-pill">Welcome Back</span>
          <h1 className="bc-heading">Login</h1>
          <p className="text-sm bc-muted">Sign in to continue your BloomCycle journey.</p>
          <div className="rounded-xl bg-[var(--color-support-50)] p-4 text-sm text-[var(--color-support-600)]">
            Your account data is protected with Supabase auth and row-level security.
          </div>
        </article>

        <article className="bc-card space-y-4 p-6">
          {params.message ? <p className="bc-alert-info">{params.message}</p> : null}
          {params.error ? <p className="bc-alert-warn">{params.error}</p> : null}

          <form action={signIn} className="space-y-3">
            <label className="bc-label">
              <span>Email</span>
              <input name="email" type="email" required className="bc-input" />
            </label>
            <label className="bc-label">
              <span>Password</span>
              <input name="password" type="password" required minLength={6} className="bc-input" />
            </label>
            <FormSubmitButton
              pendingText="Logging in..."
              showFullScreenLoader
              className="bc-btn-primary w-full text-sm"
            >
              Login
            </FormSubmitButton>
          </form>

          <div className="flex items-center justify-between text-sm">
            <Link href="/reset-password" className="text-[var(--color-primary-700)] underline">
              Forgot password?
            </Link>
            <Link href="/signup" className="text-[var(--color-primary-700)] underline">
              Create account
            </Link>
          </div>
        </article>
      </section>
    </main>
  );
}
