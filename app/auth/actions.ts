"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { createClient } from "@/utils/supabase/server";

function getString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

export async function signUp(formData: FormData) {
  const email = getString(formData, "email");
  const password = getString(formData, "password");
  const confirmPassword = getString(formData, "confirm_password");
  const consent = getString(formData, "consent");

  if (!email || !password) {
    redirect("/signup?error=Email+and+password+are+required");
  }

  if (confirmPassword && confirmPassword !== password) {
    redirect("/signup?error=Passwords+do+not+match");
  }

  if (!consent) {
    redirect("/signup?error=Please+accept+the+terms+to+continue");
  }

  const supabase = await createClient();
  const origin = (await headers()).get("origin") ?? "";

  const { error, data } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: origin ? `${origin}/auth/callback?next=/dashboard` : undefined,
    },
  });

  if (error) {
    redirect(`/signup?error=${encodeURIComponent(error.message)}`);
  }

  if (!data.session) {
    redirect("/login?message=Check+your+email+to+confirm+your+account");
  }

  redirect("/onboarding");
}

export async function signIn(formData: FormData) {
  const email = getString(formData, "email");
  const password = getString(formData, "password");

  if (!email || !password) {
    redirect("/login?error=Email+and+password+are+required");
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    redirect(`/login?error=${encodeURIComponent(error.message)}`);
  }

  redirect("/dashboard");
}

export async function requestPasswordReset(formData: FormData) {
  const email = getString(formData, "email");

  if (!email) {
    redirect("/reset-password?error=Email+is+required");
  }

  const supabase = await createClient();
  const origin = (await headers()).get("origin") ?? "";

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: origin ? `${origin}/auth/callback?next=/update-password` : undefined,
  });

  if (error) {
    redirect(`/reset-password?error=${encodeURIComponent(error.message)}`);
  }

  redirect("/login?message=Password+reset+email+sent");
}

export async function updatePassword(formData: FormData) {
  const password = getString(formData, "password");
  const confirmPassword = getString(formData, "confirm_password");

  if (!password || password.length < 6) {
    redirect("/update-password?error=Password+must+be+at+least+6+characters");
  }

  if (password !== confirmPassword) {
    redirect("/update-password?error=Passwords+do+not+match");
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password });

  if (error) {
    redirect(`/update-password?error=${encodeURIComponent(error.message)}`);
  }

  redirect("/dashboard?message=Password+updated+successfully");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login?message=Signed+out");
}
