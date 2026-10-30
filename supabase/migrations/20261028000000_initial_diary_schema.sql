-- Core private data schema for AI Smart Diary.
-- Apply this migration to the Supabase project connected to this application.

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.diary_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  title text not null default '',
  content text not null default '',
  entry_date date not null default current_date,
  entry_time text not null default '',
  category text not null default 'Personal',
  mood text,
  status text not null default 'Draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint diary_entries_mood_check
    check (mood is null or mood in ('Great', 'Good', 'Okay', 'Tired', 'Sad', 'Stressed')),
  constraint diary_entries_status_check
    check (status in ('Draft', 'Published')),
  constraint diary_entries_user_id_id_key unique (user_id, id)
);

create table if not exists public.goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  title text not null,
  description text not null default '',
  target numeric(12, 2) not null,
  current_progress numeric(12, 2) not null default 0,
  unit text not null,
  target_date date,
  status text not null default 'Active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint goals_title_not_blank check (length(btrim(title)) > 0),
  constraint goals_unit_not_blank check (length(btrim(unit)) > 0),
  constraint goals_target_positive check (target > 0),
  constraint goals_progress_in_range check (current_progress >= 0 and current_progress <= target),
  constraint goals_status_check check (status in ('Active', 'Completed')),
  constraint goals_status_matches_progress check (
    status = case when current_progress >= target then 'Completed' else 'Active' end
  )
);

create table if not exists public.emotion_analyses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  diary_entry_id uuid not null,
  emotion_label text not null,
  model_version text not null,
  confidence double precision not null,
  scores jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  constraint emotion_analyses_label_not_blank
    check (length(btrim(emotion_label)) > 0),
  constraint emotion_analyses_model_version_not_blank
    check (length(btrim(model_version)) > 0),
  constraint emotion_analyses_confidence_check
    check (confidence >= 0 and confidence <= 1),
  constraint emotion_analyses_scores_object_check
    check (jsonb_typeof(scores) = 'object'),
  constraint emotion_analyses_entry_owner_fkey
    foreign key (user_id, diary_entry_id)
    references public.diary_entries (user_id, id)
    on delete cascade
);

create index if not exists diary_entries_user_date_idx
  on public.diary_entries (user_id, entry_date desc);

create index if not exists goals_user_created_idx
  on public.goals (user_id, created_at desc);

create index if not exists emotion_analyses_user_entry_idx
  on public.emotion_analyses (user_id, diary_entry_id, created_at desc);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

drop trigger if exists diary_entries_set_updated_at on public.diary_entries;
create trigger diary_entries_set_updated_at
before update on public.diary_entries
for each row execute function public.set_updated_at();

drop trigger if exists goals_set_updated_at on public.goals;
create trigger goals_set_updated_at
before update on public.goals
for each row execute function public.set_updated_at();

create or replace function public.create_profile_for_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, display_name)
  values (
    new.id,
    coalesce(
      nullif(btrim(new.raw_user_meta_data ->> 'full_name'), ''),
      nullif(btrim(new.raw_user_meta_data ->> 'name'), ''),
      ''
    )
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created_profile on auth.users;
create trigger on_auth_user_created_profile
after insert on auth.users
for each row execute function public.create_profile_for_new_user();

-- Backfill profiles for Auth users that existed before this migration.
-- Existing profile rows, if any, are preserved.
insert into public.profiles (id, display_name)
select
  users.id,
  coalesce(
    nullif(btrim(users.raw_user_meta_data ->> 'full_name'), ''),
    nullif(btrim(users.raw_user_meta_data ->> 'name'), ''),
    ''
  )
from auth.users as users
on conflict (id) do nothing;

revoke all on function public.set_updated_at() from public, anon, authenticated;
revoke all on function public.create_profile_for_new_user() from public, anon, authenticated;

alter table public.profiles enable row level security;
alter table public.diary_entries enable row level security;
alter table public.goals enable row level security;
alter table public.emotion_analyses enable row level security;

drop policy if exists "Users can read their own profile" on public.profiles;
create policy "Users can read their own profile"
on public.profiles for select
to authenticated
using ((select auth.uid()) = id);

drop policy if exists "Users can create their own profile" on public.profiles;
create policy "Users can create their own profile"
on public.profiles for insert
to authenticated
with check ((select auth.uid()) = id);

drop policy if exists "Users can update their own profile" on public.profiles;
create policy "Users can update their own profile"
on public.profiles for update
to authenticated
using ((select auth.uid()) = id)
with check ((select auth.uid()) = id);

drop policy if exists "Users can delete their own profile" on public.profiles;
create policy "Users can delete their own profile"
on public.profiles for delete
to authenticated
using ((select auth.uid()) = id);

drop policy if exists "Users can read their own diary entries" on public.diary_entries;
create policy "Users can read their own diary entries"
on public.diary_entries for select
to authenticated
using ((select auth.uid()) = user_id);

drop policy if exists "Users can create their own diary entries" on public.diary_entries;
create policy "Users can create their own diary entries"
on public.diary_entries for insert
to authenticated
with check ((select auth.uid()) = user_id);

drop policy if exists "Users can update their own diary entries" on public.diary_entries;
create policy "Users can update their own diary entries"
on public.diary_entries for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

drop policy if exists "Users can delete their own diary entries" on public.diary_entries;
create policy "Users can delete their own diary entries"
on public.diary_entries for delete
to authenticated
using ((select auth.uid()) = user_id);

drop policy if exists "Users can read their own goals" on public.goals;
create policy "Users can read their own goals"
on public.goals for select
to authenticated
using ((select auth.uid()) = user_id);

drop policy if exists "Users can create their own goals" on public.goals;
create policy "Users can create their own goals"
on public.goals for insert
to authenticated
with check ((select auth.uid()) = user_id);

drop policy if exists "Users can update their own goals" on public.goals;
create policy "Users can update their own goals"
on public.goals for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

drop policy if exists "Users can delete their own goals" on public.goals;
create policy "Users can delete their own goals"
on public.goals for delete
to authenticated
using ((select auth.uid()) = user_id);

drop policy if exists "Users can read their own emotion analyses" on public.emotion_analyses;
create policy "Users can read their own emotion analyses"
on public.emotion_analyses for select
to authenticated
using ((select auth.uid()) = user_id);

drop policy if exists "Users can create their own emotion analyses" on public.emotion_analyses;
create policy "Users can create their own emotion analyses"
on public.emotion_analyses for insert
to authenticated
with check ((select auth.uid()) = user_id);

drop policy if exists "Users can update their own emotion analyses" on public.emotion_analyses;
create policy "Users can update their own emotion analyses"
on public.emotion_analyses for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

drop policy if exists "Users can delete their own emotion analyses" on public.emotion_analyses;
create policy "Users can delete their own emotion analyses"
on public.emotion_analyses for delete
to authenticated
using ((select auth.uid()) = user_id);

grant select, insert, update, delete
on public.profiles, public.diary_entries, public.goals, public.emotion_analyses
to authenticated;
