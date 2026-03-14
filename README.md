This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Supabase setup

1. Copy the example env file and fill your Supabase values:

```bash
cp .env.local.example .env.local
```

2. Restart the dev server after changing env values.

3. Use these helpers in your app:

- Browser/client components: `utils/supabase/client.ts`
- Server components/actions/routes: `utils/supabase/server.ts`
- Session refresh middleware: `middleware.ts`

## Phase 1 auth + profile

1. Run SQL migration in your Supabase project:

- `supabase/migrations/20260314_phase1_user_profiles.sql`

2. Start app and test:

```bash
npm run dev
```

3. Open:

- `/login` for login
- `/signup` for account creation
- `/reset-password` to request password reset email
- `/update-password` to set a new password after opening reset link
- `/onboarding` to save `user_profiles`
- `/dashboard` to verify session and profile
- `/health/supabase` and `/api/supabase/ping` to verify connection

Auth callback routes used by Supabase email links:

- `/auth/callback` (code exchange)
- `/auth/confirm` (token-hash verification fallback)

## Phase 2 cycle + symptoms

1. Run SQL migration in Supabase:

- `supabase/migrations/20260314_phase2_cycle_and_symptoms.sql`

2. Use these routes:

- `/cycle` for menstrual cycle calendar, period CRUD, and cycle insights
- `/cycle/symptoms` for daily symptom CRUD and trend summary

## Phase 3 pregnancy basics

1. Run SQL migration in Supabase:

- `supabase/migrations/20260314_phase3_pregnancy_basics.sql`

2. Use these routes:

- `/pregnancy` pregnancy setup, current week/trimester, weekly logs
- `/pregnancy/week/[weekNumber]` week-specific overview content
- `/pregnancy/kick-counter` kick counting session logs
- `/pregnancy/contraction-timer` contraction timer logs

## Phase 4 learn content library

1. Run SQL migration in Supabase:

- `supabase/migrations/20260314_phase4_learn_articles.sql`
- `supabase/migrations/20260314_phase4_articles_owner_scope.sql`

2. Use these routes:

- `/learn` public article listing with topic/stage filters
- `/learn/[slug]` article details + related content
- `/learn/admin` minimal article admin CRUD (authenticated)

## Phase 5 reminders + export

1. Run SQL migration in Supabase:

- `supabase/migrations/20260314_phase5_reminders_and_export.sql`

2. Use these routes:

- `/appointments` appointment management CRUD
- `/medications` medications and supplements CRUD
- `/reminders` in-app reminder configuration CRUD
- `/settings/data-export` download cycle + pregnancy CSV and view export history

## Phase 6 community

1. Run SQL migration in Supabase:

- `supabase/migrations/20260314_phase6_community.sql`

2. Use these routes:

- `/community` posts feed + create/edit/delete post + category filters
- `/community/post/[id]` post detail with comments and report action

## Phase 7 advanced insights

1. Run SQL migration in Supabase:

- `supabase/migrations/20260314_phase7_advanced_insights.sql`

2. Use these routes:

- `/insights` advanced trend analytics (cycle variability, symptom patterns, phase-based view)

## UI reference

UI implementation follows:

- `UI_STRUCTURE.md`

## Playwright e2e

Run module smoke tests:

```bash
npm run test:e2e
```

Optional logged-in module checks require credentials:

```bash
E2E_EMAIL=your-user@example.com E2E_PASSWORD=your-password npm run test:e2e
```

Notes:

- `tests/e2e/modules.spec.ts`: public and protected-route smoke checks (logged-out behavior).
- `tests/e2e/logged-in-modules.spec.ts`: logged-in module route checks (auto-skips if `E2E_EMAIL`/`E2E_PASSWORD` are missing).
