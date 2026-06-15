-- Run this in the Supabase SQL Editor.
-- Public signup should be disabled in Authentication > Providers > Email.

create table if not exists public.admin_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.team_daily_status (
  id bigint generated always as identity primary key,
  team_id integer not null check (team_id between 1 and 8),
  recorded_date date not null,
  payload jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (team_id, recorded_date)
);

alter table public.admin_profiles enable row level security;
alter table public.team_daily_status enable row level security;

create policy "admins can read own profile"
on public.admin_profiles for select
to authenticated
using (user_id = auth.uid());

create policy "registered admins can read team status"
on public.team_daily_status for select
to authenticated
using (
  exists (
    select 1 from public.admin_profiles
    where admin_profiles.user_id = auth.uid()
  )
);

create policy "registered admins can insert team status"
on public.team_daily_status for insert
to authenticated
with check (
  exists (
    select 1 from public.admin_profiles
    where admin_profiles.user_id = auth.uid()
  )
);

create policy "registered admins can update team status"
on public.team_daily_status for update
to authenticated
using (
  exists (
    select 1 from public.admin_profiles
    where admin_profiles.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1 from public.admin_profiles
    where admin_profiles.user_id = auth.uid()
  )
);
