import { NextResponse } from "next/server";

import { createClient } from "@/utils/supabase/server";

export async function GET() {
  const supabaseUrlSet = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL);
  const supabaseAnonKeySet = Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

  const supabase = await createClient();
  const authCheck = await supabase.auth.getSession();

  return NextResponse.json({
    ok: !authCheck.error,
    checked_at: new Date().toISOString(),
    env: {
      supabase_url_set: supabaseUrlSet,
      supabase_anon_key_set: supabaseAnonKeySet,
    },
    auth_api: {
      reachable: !authCheck.error,
      error: authCheck.error?.message ?? null,
      has_session: Boolean(authCheck.data.session),
    },
  });
}
