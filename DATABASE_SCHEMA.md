# DATABASE_SCHEMA.md – BloomCycle

This file documents the relational data model for BloomCycle, implemented in Supabase (PostgreSQL).  
Every table with user data must have Row Level Security (RLS) enabled and use `user_id` or `owner_id` for access control.

---

## 1. Conventions

- **Primary keys:** `id uuid default gen_random_uuid()` unless otherwise needed.  
- **Timestamps:** `created_at timestamptz default now()`, `updated_at timestamptz default now()` (with trigger).  
- **User ownership:** `user_id uuid references auth.users (id)` for user-owned data.  
- **Soft enums:** Use Postgres enums where stable; otherwise `text` with validation at application layer.  
- **JSON:** Use `jsonb` for flexible/optional structured data.

Suggested enums (you can create as Postgres enums or keep as text):

- `user_goal`: `cycle_tracking`, `ttc`, `pregnant`, `postpartum`  
- `pregnancy_status`: `none`, `trying`, `pregnant`, `postpartum`  
- `pregnancy_state`: `ongoing`, `completed`, `loss`  
- `symptom_type`: `mood`, `pain`, `energy`, `other`  
- `breast_side`: `left`, `right`, `both`  
- `feed_type`: `breast`, `bottle`, `pump`  
- `appointment_status`: `scheduled`, `completed`, `canceled`  
- `reminder_type`: `medication`, `appointment`, `custom`  
- `delivery_channel`: `in_app`, `email`, `push`, `sms`  

---

## 2. Users & Profiles

### 2.1 `user_profiles`

User-level metadata and health preferences.

- `id uuid primary key references auth.users (id)`  
- `full_name text`  
- `dob date`  
- `country text`  
- `time_zone text`  
- `sex_at_birth text`  
- `goal user_goal`  
- `pregnancy_status pregnancy_status default 'none'`  
- `medical_history jsonb`  — conditions, allergies, surgeries  
- `preferences jsonb`  — notification settings, language, etc.  
- `created_at timestamptz default now()`  
- `updated_at timestamptz default now()`  

Index:

- `idx_user_profiles_goal (goal)`

---

## 3. Menstrual Cycles & Symptoms

### 3.1 `menstrual_cycles`

Tracks individual cycles and period info.

- `id uuid primary key`  
- `user_id uuid not null references auth.users (id)`  
- `cycle_start_date date not null`  
- `cycle_end_date date`  
- `average_cycle_length integer`  
- `flow_intensity smallint`  — e.g., 1–5 or map to light/medium/heavy  
- `notes text`  
- `created_at timestamptz default now()`  
- `updated_at timestamptz default now()`  

Indexes:

- `idx_menstrual_cycles_user_date (user_id, cycle_start_date)`  

### 3.2 `symptoms`

Daily or per-event symptom logs.

- `id uuid primary key`  
- `user_id uuid not null references auth.users (id)`  
- `date date not null`  
- `type symptom_type not null`  
- `label text not null`  — e.g. "cramps", "headache"  
- `intensity smallint`  — 1–5 scale  
- `metadata jsonb`  — optional structured details  
- `created_at timestamptz default now()`  

Indexes:

- `idx_symptoms_user_date (user_id, date)`  

---

## 4. Ovulation & Fertility

### 4.1 `basal_body_temperature`

Optional but useful for fertility accuracy.

- `id uuid primary key`  
- `user_id uuid not null references auth.users (id)`  
- `recorded_at timestamptz not null`  
- `temperature numeric(4,2) not null`  
- `unit text default 'C'`  
- `source text`  — `"manual"` or device name/id  
- `raw_data jsonb`  — full device payload if available  
- `created_at timestamptz default now()`  

Indexes:

- `idx_bbt_user_time (user_id, recorded_at)`  

### 4.2 `ovulation_predictions`

Derived per cycle.

- `id uuid primary key`  
- `user_id uuid not null references auth.users (id)`  
- `cycle_id uuid not null references menstrual_cycles (id)`  
- `fertile_window_start date`  
- `fertile_window_end date`  
- `ovulation_date_prediction date`  
- `prediction_confidence numeric(3,2)`  — 0–1 scale (optional)  
- `created_at timestamptz default now()`  

Indexes:

- `idx_ovulation_predictions_user_cycle (user_id, cycle_id)`  

---

## 5. Pregnancy

### 5.1 `pregnancies`

Core pregnancy record.

- `id uuid primary key`  
- `user_id uuid not null references auth.users (id)`  
- `lmp_date date`  — last menstrual period  
- `estimated_due_date date`  
- `status pregnancy_state default 'ongoing'`  
- `risk_flags jsonb`  — high-risk markers, flags (non-diagnostic)  
- `created_at timestamptz default now()`  
- `updated_at timestamptz default now()`  

Indexes:

- `idx_pregnancies_user (user_id)`  

### 5.2 `pregnancy_logs`

Aggregated weekly/periodic logs.

- `id uuid primary key`  
- `pregnancy_id uuid not null references pregnancies (id)`  
- `week_number integer not null`  
- `symptoms jsonb`  — structured weekly summary  
- `weight numeric(5,2)`  
- `notes text`  
- `logged_at timestamptz default now()`  

Index:

- `idx_pregnancy_logs_pregnancy_week (pregnancy_id, week_number)`  

### 5.3 `kick_counts`

Kick counting sessions.

- `id uuid primary key`  
- `pregnancy_id uuid not null references pregnancies (id)`  
- `started_at timestamptz not null`  
- `ended_at timestamptz`  
- `kick_count integer`  
- `created_at timestamptz default now()`  

### 5.4 `contractions`

Contraction timer logs.

- `id uuid primary key`  
- `pregnancy_id uuid not null references pregnancies (id)`  
- `started_at timestamptz not null`  
- `ended_at timestamptz`  
- `duration_seconds integer`  
- `interval_seconds integer`  — gap from previous contraction in seconds  
- `created_at timestamptz default now()`  

Indexes:

- `idx_contractions_pregnancy_time (pregnancy_id, started_at)`  

---

## 6. Baby & Postpartum

### 6.1 `baby_profiles`

One or more babies linked to the user.

- `id uuid primary key`  
- `user_id uuid not null references auth.users (id)`  
- `name text`  
- `dob date`  
- `gender text`  
- `birth_weight numeric(5,2)`  
- `birth_length numeric(5,2)`  
- `created_at timestamptz default now()`  

### 6.2 `baby_milestones`

Development milestones.

- `id uuid primary key`  
- `baby_id uuid not null references baby_profiles (id)`  
- `milestone_type text`  — e.g. "first smile", "first steps"  
- `achieved_at date`  
- `notes text`  
- `created_at timestamptz default now()`  

### 6.3 `breastfeeding_sessions`

Feeding logs.

- `id uuid primary key`  
- `baby_id uuid not null references baby_profiles (id)`  
- `started_at timestamptz not null`  
- `ended_at timestamptz`  
- `side breast_side`  
- `type feed_type`  
- `created_at timestamptz default now()`  

Indexes:

- `idx_breastfeeding_baby_time (baby_id, started_at)`  

---

## 7. Health Metrics & Lab Results

### 7.1 `health_metrics`

Generic time-series metrics.

- `id uuid primary key`  
- `user_id uuid not null references auth.users (id)`  
- `metric_type text`  — `weight`, `bp`, `hr`, `sleep`, `steps`, etc.  
- `recorded_at timestamptz not null`  
- `value numeric`  
- `unit text`  
- `source text`  — `"manual"` or device name  
- `metadata jsonb`  
- `created_at timestamptz default now()`  

Indexes:

- `idx_health_metrics_user_type_time (user_id, metric_type, recorded_at)`  

### 7.2 `lab_results`

Stored lab test outcomes.

- `id uuid primary key`  
- `user_id uuid not null references auth.users (id)`  
- `test_name text not null`  
- `ordered_at timestamptz`  
- `result_at timestamptz`  
- `result_values jsonb`  — key/value for lab parameters  
- `file_url text`  — link to Supabase Storage file  
- `provider_id uuid`  — future link to providers  
- `notes text`  
- `created_at timestamptz default now()`  

Index:

- `idx_lab_results_user (user_id)`  

---

## 8. Appointments, Medications, Reminders

### 8.1 `appointments`

Healthcare visits and events.

- `id uuid primary key`  
- `user_id uuid not null references auth.users (id)`  
- `provider_id uuid`  
- `title text not null`  
- `description text`  
- `date_time timestamptz not null`  
- `location text`  
- `status appointment_status default 'scheduled'`  
- `created_at timestamptz default now()`  

Indexes:

- `idx_appointments_user_time (user_id, date_time)`  

### 8.2 `medications`

Medications and supplements.

- `id uuid primary key`  
- `user_id uuid not null references auth.users (id)`  
- `name text not null`  
- `dosage text`  
- `frequency text`  — free-form for now  
- `route text`  — e.g. oral, topical  
- `start_date date`  
- `end_date date`  
- `type text`  — `medication` or `supplement`  
- `created_at timestamptz default now()`  

### 8.3 `reminders`

Reminder configuration.

- `id uuid primary key`  
- `user_id uuid not null references auth.users (id)`  
- `medication_id uuid references medications (id)`  
- `type reminder_type not null`  
- `schedule jsonb not null`  — times, days of week, etc.  
- `delivery_channel delivery_channel default 'in_app'`  
- `active boolean default true`  
- `created_at timestamptz default now()`  

Indexes:

- `idx_reminders_user_type (user_id, type)`  

---

## 9. Content & Community (Optional Phases)

### 9.1 `articles`

Educational content.

- `id uuid primary key`  
- `title text not null`  
- `slug text not null unique`  
- `body text not null`  — markdown or rich text  
- `topic text`  — `cycle`, `fertility`, `pregnancy`, `postpartum`, `baby`  
- `stage text`  — e.g. `pregnancy_week_10`  
- `language text default 'en'`  
- `is_premium boolean default false`  
- `published_at timestamptz`  
- `created_at timestamptz default now()`  

### 9.2 `community_posts`

User posts by category.

- `id uuid primary key`  
- `user_id uuid not null references auth.users (id)`  
- `category text`  — `ttc`, `trimester_1`, `trimester_2`, etc.  
- `title text not null`  
- `content text not null`  
- `is_anonymous boolean default false`  
- `flags jsonb`  — moderation flags  
- `created_at timestamptz default now()`  
- `updated_at timestamptz default now()`  

### 9.3 `community_comments`

Comments on posts.

- `id uuid primary key`  
- `post_id uuid not null references community_posts (id)`  
- `user_id uuid not null references auth.users (id)`  
- `content text not null`  
- `created_at timestamptz default now()`  

Indexes:

- `idx_community_comments_post (post_id)`  

---

## 10. System Tables

### 10.1 `notifications`

In-app notifications.

- `id uuid primary key`  
- `user_id uuid not null references auth.users (id)`  
- `title text not null`  
- `body text not null`  
- `type text`  
- `payload jsonb`  
- `read_at timestamptz`  
- `created_at timestamptz default now()`  

Index:

- `idx_notifications_user_created (user_id, created_at desc)`  

### 10.2 `data_exports`

User data exports.

- `id uuid primary key`  
- `user_id uuid not null references auth.users (id)`  
- `requested_at timestamptz default now()`  
- `status text not null default 'pending'`  — `pending`, `processing`, `ready`, `failed`  
- `file_url text`  
- `export_type text`  — `cycle_history`, `full_profile`, etc.  
- `error text`  

Index:

- `idx_data_exports_user (user_id)`  

---

## 11. RLS Strategy (Overview)

For every user-owned table (`*_cycles`, `symptoms`, `pregnancies`, etc.):

- Allow `SELECT`, `INSERT`, `UPDATE`, `DELETE` only when `auth.uid() = user_id` (or user is linked via foreign key path).  
- For child tables (e.g., `pregnancy_logs`), policies can join back to parent if needed, or duplicate `user_id` on the child rows.

You can convert each section above into SQL migrations or Supabase GUI definitions as you build out the app.
