import Link from "next/link";
import { redirect } from "next/navigation";

import { updatePassword } from "@/app/auth/actions";
import { FormSubmitButton } from "@/components/ui/form-submit-button";
import { createClient } from "@/utils/supabase/server";

type UpdatePasswordPageProps = {
  searchParams: Promise<{ error?: string; message?: string }>;
};

export default async function UpdatePasswordPage({ searchParams }: UpdatePasswordPageProps) {
  const params = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?error=Please+open+the+password+reset+link+from+your+email+again");
  }

  return (
    <main className="bc-page">
      <section className="mx-auto w-full max-w-xl space-y-4 bc-card p-6">
        <span className="bc-pill">Account Recovery</span>
        <h1 className="bc-heading">Set new password</h1>
        <p className="text-sm bc-muted">Create a new password to complete account recovery.</p>

        {params.message ? <p className="bc-alert-info">{params.message}</p> : null}
        {params.error ? <p className="bc-alert-warn">{params.error}</p> : null}

        <form action={updatePassword} className="space-y-3">
          <label className="bc-label">
            <span>New password</span>
            <input name="password" type="password" minLength={6} required className="bc-input" />
          </label>
          <label className="bc-label">
            <span>Confirm new password</span>
            <input name="confirm_password" type="password" minLength={6} required className="bc-input" />
          </label>
          <FormSubmitButton
            pendingText="Updating password..."
            showFullScreenLoader
            className="bc-btn-primary w-full text-sm"
          >
            Update password
          </FormSubmitButton>
        </form>

        <Link href="/login" className="block text-sm text-[var(--color-primary-700)] underline">
          Back to login
        </Link>
      </section>
    </main>
  );
}
