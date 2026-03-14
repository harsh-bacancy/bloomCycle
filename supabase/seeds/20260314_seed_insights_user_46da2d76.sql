-- Seed data for insights testing
-- Target user: 46da2d76-c371-4d14-acc3-7f7bd1cdc44f
-- Safe to rerun: removes only previously seeded rows for this user.

begin;

-- Ensure extension for UUID helpers is present.
create extension if not exists pgcrypto;

-- Optional check: user exists in auth.users.
do $$
begin
  if not exists (
    select 1 from auth.users where id = '46da2d76-c371-4d14-acc3-7f7bd1cdc44f'::uuid
  ) then
    raise exception 'User 46da2d76-c371-4d14-acc3-7f7bd1cdc44f does not exist in auth.users';
  end if;
end
$$;

-- Cleanup previous seeded records for this user only.
-- Child tables first.
delete from public.kick_counts kc
using public.pregnancies p
where kc.pregnancy_id = p.id
  and p.user_id = '46da2d76-c371-4d14-acc3-7f7bd1cdc44f'::uuid
  and coalesce(p.risk_flags->>'seed', 'false') = 'true';

delete from public.contractions c
using public.pregnancies p
where c.pregnancy_id = p.id
  and p.user_id = '46da2d76-c371-4d14-acc3-7f7bd1cdc44f'::uuid
  and coalesce(p.risk_flags->>'seed', 'false') = 'true';

delete from public.pregnancy_logs pl
using public.pregnancies p
where pl.pregnancy_id = p.id
  and p.user_id = '46da2d76-c371-4d14-acc3-7f7bd1cdc44f'::uuid
  and coalesce(p.risk_flags->>'seed', 'false') = 'true';

delete from public.pregnancies
where user_id = '46da2d76-c371-4d14-acc3-7f7bd1cdc44f'::uuid
  and coalesce(risk_flags->>'seed', 'false') = 'true';

delete from public.symptoms
where user_id = '46da2d76-c371-4d14-acc3-7f7bd1cdc44f'::uuid
  and coalesce(metadata->>'seed', 'false') = 'true';

delete from public.menstrual_cycles
where user_id = '46da2d76-c371-4d14-acc3-7f7bd1cdc44f'::uuid
  and notes like '[seed] %';

-- Seed menstrual cycles (longer history for clearer trend charts).
insert into public.menstrual_cycles (
  id, user_id, cycle_start_date, cycle_end_date, average_cycle_length, flow_intensity, notes
)
values
  (gen_random_uuid(), '46da2d76-c371-4d14-acc3-7f7bd1cdc44f'::uuid, current_date - 392, current_date - 387, 28, 3, '[seed] cycle 1'),
  (gen_random_uuid(), '46da2d76-c371-4d14-acc3-7f7bd1cdc44f'::uuid, current_date - 364, current_date - 359, 27, 2, '[seed] cycle 2'),
  (gen_random_uuid(), '46da2d76-c371-4d14-acc3-7f7bd1cdc44f'::uuid, current_date - 335, current_date - 330, 29, 3, '[seed] cycle 3'),
  (gen_random_uuid(), '46da2d76-c371-4d14-acc3-7f7bd1cdc44f'::uuid, current_date - 306, current_date - 301, 28, 4, '[seed] cycle 4'),
  (gen_random_uuid(), '46da2d76-c371-4d14-acc3-7f7bd1cdc44f'::uuid, current_date - 278, current_date - 273, 30, 3, '[seed] cycle 5'),
  (gen_random_uuid(), '46da2d76-c371-4d14-acc3-7f7bd1cdc44f'::uuid, current_date - 249, current_date - 244, 29, 3, '[seed] cycle 6'),
  (gen_random_uuid(), '46da2d76-c371-4d14-acc3-7f7bd1cdc44f'::uuid, current_date - 220, current_date - 215, 28, 2, '[seed] cycle 7'),
  (gen_random_uuid(), '46da2d76-c371-4d14-acc3-7f7bd1cdc44f'::uuid, current_date - 192, current_date - 187, 29, 3, '[seed] cycle 8'),
  (gen_random_uuid(), '46da2d76-c371-4d14-acc3-7f7bd1cdc44f'::uuid, current_date - 163, current_date - 158, 28, 4, '[seed] cycle 9'),
  (gen_random_uuid(), '46da2d76-c371-4d14-acc3-7f7bd1cdc44f'::uuid, current_date - 134, current_date - 129, 30, 3, '[seed] cycle 10'),
  (gen_random_uuid(), '46da2d76-c371-4d14-acc3-7f7bd1cdc44f'::uuid, current_date - 105, current_date - 100, 29, 2, '[seed] cycle 11'),
  (gen_random_uuid(), '46da2d76-c371-4d14-acc3-7f7bd1cdc44f'::uuid, current_date - 76,  current_date - 71,  28, 3, '[seed] cycle 12'),
  (gen_random_uuid(), '46da2d76-c371-4d14-acc3-7f7bd1cdc44f'::uuid, current_date - 47,  current_date - 42,  29, 4, '[seed] cycle 13'),
  (gen_random_uuid(), '46da2d76-c371-4d14-acc3-7f7bd1cdc44f'::uuid, current_date - 18,  null,               28, 2, '[seed] current cycle');

-- Seed dense symptom history (90 days, periodic entries) for phase and frequency charts.
with symptom_days as (
  select d::date as day
  from generate_series(current_date - 120, current_date - 1, interval '3 day') as d
),
symptom_templates as (
  select *
  from (
    values
      ('pain',   'cramps'),
      ('pain',   'lower back pain'),
      ('mood',   'irritability'),
      ('mood',   'anxious'),
      ('energy', 'fatigue'),
      ('energy', 'low energy'),
      ('other',  'bloating'),
      ('other',  'headache')
  ) as t(type, label)
),
expanded as (
  select
    sd.day,
    st.type,
    st.label,
    row_number() over (order by sd.day, st.type, st.label) as rn
  from symptom_days sd
  join symptom_templates st on true
  where extract(day from sd.day)::int % 2 = 0
     or st.type in ('pain', 'mood')
)
insert into public.symptoms (id, user_id, date, type, label, intensity, metadata)
select
  gen_random_uuid(),
  '46da2d76-c371-4d14-acc3-7f7bd1cdc44f'::uuid,
  e.day,
  e.type,
  e.label,
  ((extract(day from e.day)::int + e.rn) % 4 + 1),
  jsonb_build_object('seed', true, 'source', 'phase7_seed')
from expanded e;

-- Seed one ongoing pregnancy + expanded weekly logs.
with inserted_pregnancy as (
  insert into public.pregnancies (
    id, user_id, lmp_date, estimated_due_date, status, risk_flags
  )
  values (
    gen_random_uuid(),
    '46da2d76-c371-4d14-acc3-7f7bd1cdc44f'::uuid,
    current_date - 98,
    current_date + 182,
    'ongoing',
    '{"seed": true}'::jsonb
  )
  returning id
)
insert into public.pregnancy_logs (id, pregnancy_id, week_number, symptoms, weight, notes, logged_at)
select gen_random_uuid(), ip.id, v.week_number, v.symptoms::jsonb, v.weight, v.notes, now() - v.days_ago * interval '1 day'
from inserted_pregnancy ip
cross join (
  values
    (8,  '{"mood":"mixed","energy":"low","pain":"mild"}',      60.8::numeric, '[seed] week 8 log',  56),
    (9,  '{"mood":"good","energy":"medium","pain":"mild"}',    61.0::numeric, '[seed] week 9 log',  49),
    (10, '{"mood":"good","energy":"medium","pain":"mild"}',    61.2::numeric, '[seed] week 10 log', 42),
    (11, '{"mood":"mixed","energy":"low","pain":"mild"}',      61.7::numeric, '[seed] week 11 log', 35),
    (12, '{"mood":"good","energy":"medium","pain":"none"}',    62.0::numeric, '[seed] week 12 log', 28),
    (13, '{"mood":"good","energy":"medium","pain":"none"}',    62.4::numeric, '[seed] week 13 log', 21),
    (14, '{"mood":"good","energy":"medium","pain":"none"}',    62.8::numeric, '[seed] week 14 log', 14),
    (15, '{"mood":"calm","energy":"medium","pain":"none"}',    63.1::numeric, '[seed] week 15 log', 7),
    (16, '{"mood":"good","energy":"high","pain":"none"}',      63.5::numeric, '[seed] week 16 log', 2)
) as v(week_number, symptoms, weight, notes, days_ago);

-- Seed kick counts + contractions for the seeded pregnancy.
with p as (
  select id
  from public.pregnancies
  where user_id = '46da2d76-c371-4d14-acc3-7f7bd1cdc44f'::uuid
    and coalesce(risk_flags->>'seed', 'false') = 'true'
  order by created_at desc
  limit 1
)
insert into public.kick_counts (id, pregnancy_id, started_at, ended_at, kick_count)
select gen_random_uuid(), p.id, now() - (v.days_ago || ' day')::interval, now() - (v.days_ago || ' day')::interval + (v.minutes || ' minutes')::interval, v.kicks
from p
cross join (
  values
    (10, 18, 11),
    (9,  20, 13),
    (8,  18, 12),
    (7,  21, 14),
    (6,  19, 13),
    (5,  18, 15),
    (4,  17, 14),
    (3,  16, 16)
) as v(days_ago, minutes, kicks);

with p as (
  select id
  from public.pregnancies
  where user_id = '46da2d76-c371-4d14-acc3-7f7bd1cdc44f'::uuid
    and coalesce(risk_flags->>'seed', 'false') = 'true'
  order by created_at desc
  limit 1
)
insert into public.contractions (id, pregnancy_id, started_at, ended_at, duration_seconds, interval_seconds)
select
  gen_random_uuid(),
  p.id,
  now() - (v.days_ago || ' day')::interval + (v.offset_minutes || ' minutes')::interval,
  now() - (v.days_ago || ' day')::interval + (v.offset_minutes || ' minutes')::interval + (v.duration_seconds || ' seconds')::interval,
  v.duration_seconds,
  v.interval_seconds
from p
cross join (
  values
    (6, 0,  48, 0),
    (6, 9,  45, 540),
    (5, 0,  50, 0),
    (5, 10, 52, 600),
    (4, 0,  55, 0),
    (4, 8,  50, 480),
    (3, 0,  58, 0),
    (3, 7,  54, 420)
) as v(days_ago, offset_minutes, duration_seconds, interval_seconds);

commit;
