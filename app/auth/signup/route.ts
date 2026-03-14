import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { createClient } from "@/utils/supabase/server";

function trimTrailingSlash(url: string) {
  return url.replace(/\/+$/, "");
}

function buildAppBaseUrl(request: NextRequest) {
  const envSiteUrl =
    process.env.NEXT_PUBLIC_SITE_URL ??
    process.env.SITE_URL ??
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "");

  if (envSiteUrl) {
    return trimTrailingSlash(envSiteUrl);
  }

  const forwardedProto = request.headers.get("x-forwarded-proto");
  const forwardedHost = request.headers.get("x-forwarded-host");
  if (forwardedProto && forwardedHost) {
    return `${forwardedProto}://${forwardedHost}`;
  }

  return request.nextUrl.origin;
}

function getString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function redirectTo(request: NextRequest, path: string) {
  return NextResponse.redirect(new URL(path, request.nextUrl.origin));
}

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const email = getString(formData, "email");
  const password = getString(formData, "password");
  const confirmPassword = getString(formData, "confirm_password");
  const consent = getString(formData, "consent");

  if (!email || !password) {
    return redirectTo(request, "/signup?error=Email+and+password+are+required");
  }

  if (confirmPassword && confirmPassword !== password) {
    return redirectTo(request, "/signup?error=Passwords+do+not+match");
  }

  if (!consent) {
    return redirectTo(request, "/signup?error=Please+accept+the+terms+to+continue");
  }

  const supabase = await createClient();
  const baseUrl = buildAppBaseUrl(request);

  const { error, data } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${baseUrl}/auth/callback?next=/dashboard`,
    },
  });

  if (error) {
    return redirectTo(request, `/signup?error=${encodeURIComponent(error.message)}`);
  }

  if (!data.session) {
    return redirectTo(request, "/login?message=Check+your+email+to+confirm+your+account");
  }

  return redirectTo(request, "/onboarding");
}
