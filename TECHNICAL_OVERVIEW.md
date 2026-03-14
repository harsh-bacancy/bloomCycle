# TECHNICAL_OVERVIEW.md – BloomCycle

This document captures the technical architecture and conventions for the BloomCycle web app.

---

## 1. Stack Overview

- **Framework:** Next.js (App Router) with TypeScript  
- **Backend/Data:** Supabase (PostgreSQL, Auth, Storage, Edge Functions)  
- **UI:** React, Tailwind CSS (or similar utility framework)  
- **State/Data Fetching:** TanStack Query (React Query) + server components where possible  
- **Charts:** Recharts or Chart.js for data visualization  
- **Auth:** Supabase Auth (JWT-based)  
- **Deployment:** Vercel (recommended) + Supabase Cloud  

---

## 2. Application Architecture

### 2.1 Layers

- **Presentation layer (Next.js)**  
  Server Components for data-heavy views; Client Components for interactive widgets (calendar, charts, timers).

- **Data access layer**  
  Supabase client in server components for privileged queries; Supabase client in client components with user JWT for scoped queries; optional wrapper functions in `lib/db/**`.

- **Domain logic**  
  Simple, testable services per domain (e.g., `cycleService`, `symptomService`, `pregnancyService`, `contentService`) kept out of React components where possible.

### 2.2 Suggested folder structure

```txt
src/
  app/
    (auth)/
      login/
      signup/
      reset-password/
      update-password/
      auth/
        callback/
        confirm/
    (app)/
      dashboard/
      cycle/
      fertility/
      pregnancy/
      baby/
      learn/
      community/
      settings/
    api/
      cycles/
      symptoms/
      pregnancy/
      appointments/
      medications/
      reminders/
      export/
  components/
    ui/
    layout/
    cycle/
    pregnancy/
    baby/
    charts/
  lib/
    supabase/
    auth/
    validators/
    services/
  types/
  styles/
```

### 2.3 Loading convention

- Keep a global route-transition loader in `app/loading.tsx`.
- Reuse shared UI component `components/ui/full-screen-loader.tsx` for consistency.
- For expensive sections, optionally add nested `loading.tsx` files at route-segment level while keeping the global loader in place.

### 2.4 Phase 2 implementation baseline

- Cycle tracking page: `/cycle`
  - Calendar-style monthly view (period + fertile window highlights)
  - Cycle CRUD (create/read/update/delete) via server actions in `app/cycle/actions.ts`
  - Rule-based insights utilities in `lib/cycle/insights.ts`
  - Lightweight charts: line trend for cycle lengths
- Symptoms page: `/cycle/symptoms`
  - Daily symptom logging (`mood`, `pain`, `energy`, `other`)
  - Full CRUD + recent history + trend charts (category bars + 14-day activity bars)

### 2.5 Phase 3 implementation baseline

- Pregnancy overview page: `/pregnancy`
  - Pregnancy setup form (LMP or due date + status)
  - Current week, trimester, progress bar, and supportive weekly tip
  - Weekly check-in logs with weight + notes
- Weekly content page: `/pregnancy/week/[weekNumber]`
  - Week range and static supportive guidance sections
- Tools:
  - `/pregnancy/kick-counter` session logging + history
  - `/pregnancy/contraction-timer` contraction logging + history
- Domain utilities in `lib/pregnancy/utils.ts` for week/trimester calculations

### 2.6 Phase 4 implementation baseline

- Learn listing page: `/learn`
  - Public published article list with topic/stage/search filters
- Learn detail page: `/learn/[slug]`
  - Markdown rendering + reading-time estimate + related articles
- Minimal admin page: `/learn/admin`
  - Authenticated article create/update/delete
  - Uses server actions in `app/learn/actions.ts`
- Dashboard contextual recommendations
  - Pulls stage-aware published articles and surfaces top items on `/dashboard`

### 2.7 Phase 5 implementation baseline

- Appointments page: `/appointments`
  - CRUD for healthcare appointments (`scheduled` / `completed` / `canceled`)
- Medications page: `/medications`
  - CRUD for medications and supplements
- Reminders page: `/reminders`
  - CRUD for reminder records (type, schedule text, channel, active state)
- Data export page: `/settings/data-export`
  - CSV export endpoint `/api/export/cycle-pregnancy`
  - Export request history from `data_exports`

### 2.8 Phase 6 implementation baseline

- Community feed page: `/community`
  - Category-based feed filtering
  - Create/update/delete posts
  - Optional anonymous posting (`is_anonymous`)
- Post detail page: `/community/post/[id]`
  - Comments thread with add/delete comment actions
  - Basic moderation report flow (post flags)
- Phase 6 schema in `community_posts`, `community_comments`, `community_post_flags` with RLS

### 2.9 Phase 7 implementation baseline

- Insights page: `/insights`
  - Advanced analytics over cycle/symptom/pregnancy logs
  - Trend charts (cycle variability + symptom distributions + phase distribution)
  - Non-diagnostic insight summary cards
- Loading UX:
  - Route-level loader in `app/insights/loading.tsx`
- Phase 7 schema groundwork:
  - `integration_connections` (future wearables/provider integrations)
  - `insight_snapshots` (stored summary metrics)
