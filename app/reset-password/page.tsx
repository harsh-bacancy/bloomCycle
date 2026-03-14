import Link from "next/link";

import { requestPasswordReset } from "@/app/auth/actions";

type ResetPasswordPageProps = {
  searchParams: Promise<{ error?: string; message?: string }>;
};

export default async function ResetPasswordPage({ searchParams }: ResetPasswordPageProps) {
  const params = await searchParams;

  return (
    <main className="bc-page">
      <section className="mx-auto w-full max-w-xl space-y-4 bc-card p-6">
        <span className="bc-pill">Account Recovery</span>
        <h1 className="bc-heading">Reset password</h1>
        <p className="text-sm bc-muted">Enter your email and we will send a secure reset link.</p>

        {params.message ? <p className="bc-alert-info">{params.message}</p> : null}
        {params.error ? <p className="bc-alert-warn">{params.error}</p> : null}

        <form action={requestPasswordReset} className="space-y-3">
          <label className="bc-label">
            <span>Email</span>
            <input name="email" type="email" required className="bc-input" />
          </label>
          <button type="submit" className="bc-btn-primary w-full text-sm">
            Send reset link
          </button>
        </form>

        <Link href="/login" className="block text-sm text-[var(--color-primary-700)] underline">
          Back to login
        </Link>
      </section>
    </main>
  );
}
