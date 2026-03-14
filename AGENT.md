# AGENT.md – BloomCycle Development Context

## Project Identity

- **Name:** BloomCycle
- **Domain:** Women’s Health & Fertility
- **Form Factor:** Web application (Next.js + Supabase backend)
- **Goal:** A comprehensive, privacy‑focused companion for menstrual health, fertility, pregnancy, and early parenting.

BloomCycle is not just a tracker; it is a **guidance** tool that helps users understand their bodies, see patterns, and feel supported across different stages: cycle tracking, trying to conceive (TTC), pregnancy, postpartum, and baby care.

---

## Core Principles

1. **Health first, not hustle**
   - Prioritize accuracy, clarity, and safety over engagement hacks.
   - Avoid fear‑based messaging; communicate gently and clearly.

2. **Privacy & trust by design**
   - Assume all data is sensitive health data.
   - Minimal data collection, strong access control, transparent settings.

3. **Actionable, not overwhelming**
   - Turn raw data (cycles, symptoms, metrics) into simple, understandable insights.
   - Show clear next steps or suggestions wherever possible.

4. **Inclusive & supportive**
   - Use neutral, respectful language.
   - Design flows that work for different cultures, body types, and experiences.

5. **Non‑diagnostic**
   - This app supports but does **not** replace medical advice.
   - Always avoid diagnostic language; use “might”, “could indicate”, “consider talking to your doctor”.

---

## Target Users

- **Primary:** Women aged ~18–45 interested in:
  - Tracking their menstrual cycles.
  - Understanding fertility windows while trying to conceive.
  - Monitoring pregnancy week‑by‑week.
  - Logging early baby milestones and routines.

- **Secondary:**
  - Partners who need shared access (view-only or limited edit).
  - Healthcare providers (future phases via a provider portal).

Users may enter the product in different stages (just tracking cycles, already pregnant, newly postpartum). The product should adapt dynamically to their “current stage”.

---

## Product Scope (MVP Focus)

For the initial web MVP, BloomCycle focuses on:

1. **Menstrual Cycle Tracking**
   - Log periods, flow intensity, and notes.
   - View cycle calendar and historical trends.
   - Show simple, rule‑based ovulation and fertile window predictions.

2. **Symptom Logging**
   - Daily logs for mood, pain, energy, and other physical symptoms.
   - Simple history view and trend visualization.

3. **Basic Pregnancy Tracking**
   - Start pregnancy using last menstrual period (LMP) or due date.
   - Show current pregnancy week and trimester.
   - Surface week‑specific content and a space for notes.

4. **Educational Content**
   - Article library organized by topics (cycle, fertility, pregnancy, postpartum, baby).
   - Context‑aware content suggestions based on user stage.

5. **User Profile & Health History**
   - Profile with demographics, goals (cycle tracking / TTC / pregnant), and basic medical history.
   - Notification and privacy preferences.

6. **Reminders & Export (Essential)**
   - Medication/supplement and appointment reminders (basic).
   - Data export for cycles and pregnancy logs (CSV or similar).

Advanced features (telehealth, AI insights, wearables, provider portal, insurance integration) are explicitly considered later‑phase work.

---

## Technical Stack

- **Frontend:** Next.js (App Router), TypeScript, React, Tailwind (or similar)
- **Backend / Data:** Supabase (PostgreSQL, Auth, Storage, RLS)
- **APIs:**
  - Supabase queries for CRUD access.
  - Next.js API routes/route handlers for aggregation and 3rd‑party integrations.
- **State & Data Fetching:**
  - React Query / TanStack Query or similar for caching and synchronization.
- **Charts/Visualization:**
  - A lightweight charting library (e.g., Recharts or Chart.js) for trends.

---

## Domain Concepts & Data Model (High-Level)

Key entities that should exist in the database:

- **User & Profile**
  - `users` (auth) + `user_profiles` (demographics, goals, preferences, history)
- **Cycle & Fertility**
  - `menstrual_cycles` (period start/end, flow)
  - `symptoms` (daily logs)
  - `basal_body_temperature` (optional, for fertility accuracy)
  - `ovulation_predictions` (derived predictions)
- **Pregnancy**
  - `pregnancies` (LMP, EDD, status)
  - `pregnancy_logs` (weekly data, symptoms, notes)
  - `kick_counts`, `contractions` (simple tracking tools)
- **Baby & Postpartum**
  - `baby_profiles`
  - `baby_milestones`
  - `breastfeeding_sessions`
  - `sleep/health_metrics` (generic metrics by type)
- **Healthcare & Logistics**
  - `appointments`
  - `medications`
  - `reminders`
  - `lab_results`
- **Content & Community (future phases)**
  - `articles`
  - `community_posts`, `community_comments`
- **System**
  - `notifications`
  - `data_exports`

Design everything with **Row Level Security** in mind: every row is owned by a user (or tied to a user) and only accessible to that user unless explicitly shared.

---

## UX Principles

1. **Stage‑aware dashboards**
   - If user is in cycle‑tracking mode: show calendar + fertile window.
   - If pregnant: show current week + key tools (kick counter, notes).
   - If postpartum with baby: show baby overview + recent logs.

2. **One main action per screen**
   - Calendar: log period and symptoms.
   - Pregnancy week page: read weekly info + add notes.
   - Baby page: log milestone or feeding.

3. **Clear language**
   - Avoid jargon where possible (“fertile window” instead of “ovulatory phase” unless explained).
   - Use calm, reassuring copy; no alarming messages.

4. **Progressively reveal complexity**
   - Start with simple logs and insights.
   - Advanced analytics, charts, or filters are optional and tucked under “Insights” or “Advanced” sections.

5. **Accessibility**
   - Respect system fonts and scaling where possible.
   - Proper contrast, keyboard navigation, and ARIA where needed.

---

## Phased Development Plan (for Vibe Coding)

Use this as a mental roadmap while coding:

### Phase 1 – Foundation & Auth
- Set up Next.js + Supabase.
- Implement auth (sign up, login, reset).
- Create `user_profiles` + onboarding flow (goals, LMP or basic cycle info).
- Basic shell layout and navigation.

### Phase 2 – Cycle & Symptom Tracking
- Implement menstrual calendar view.
- CRUD for cycles and symptom logs.
- Simple cycle stats and fertile window calculations.
- Base visualization for cycle history.

### Phase 3 – Pregnancy Basics
- Create pregnancy model and flows.
- Week overview pages with static content.
- Basic tools: kick counter, contraction timer.
- Weight tracking/trends for pregnancy.

### Phase 4 – Content Library
- Articles table + minimal admin interface.
- Public “Learn” section with filters.
- Show contextual articles on dashboard.

### Phase 5 – Reminders & Export
- Medication and appointment management.
- In‑app reminders (later: email/push integration).
- CSV export of cycle and pregnancy data.

### Phase 6 – Community (Optional MVP+)
- Community posts and comments.
- Category‑based feeds (TTC, trimester, postpartum, parenting).
- Basic moderation flags and anonymous posting.

### Phase 7 – Advanced Insights & Integrations (Future)
- More sophisticated analytics (cycle irregularity, symptom patterns).
- Wearable integrations, telehealth, provider portal.
- AI‑assisted, non‑diagnostic guidance.

---

## Design & Copy Constraints

- Avoid making clinical claims or diagnoses.
- Always include “not medical advice” disclaimers where content may be interpreted as health guidance.
- Be careful with tone around sensitive events (miscarriage, infertility, complications); keep the UI flexible to support these states later.

---

## When In Doubt

- Ask: “Does this help the user understand or manage their health in a clear, respectful way?”
- If something touches sensitive health or legal territory, design it to be conservative, optional, and clearly non‑diagnostic.
- Look for the simplest implementation that matches the current phase before over‑engineering abstractions.

This file is meant to keep the **product vibe** and **domain intent** in your head while you’re deep in code. Keep it updated as the product evolves.
