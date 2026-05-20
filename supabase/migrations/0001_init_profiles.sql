-- ============================================================
-- 0001_init_profiles.sql
-- User profiles, auto-created on auth.users insert
-- ============================================================

create table public.profiles (
  id           uuid primary key references auth.users(id) on delete cascade,
  username     text unique,
  display_name text,
  avatar_url   text,
  bio          text,
  created_at   timestamptz default now() not null,
  updated_at   timestamptz default now() not null
);

-- Username must be lowercase alphanumeric + hyphens, 3–32 chars
alter table public.profiles
  add constraint profiles_username_format
  check (username ~ '^[a-z0-9][a-z0-9\-]{1,30}[a-z0-9]$');

-- Row-level security
alter table public.profiles enable row level security;

create policy "Public profiles are readable by everyone"
  on public.profiles for select
  using (true);

create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- -------------------------------------------------------
-- Trigger: auto-create a profile row on new user signup
-- -------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id)
  values (new.id);
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- -------------------------------------------------------
-- Helper: keep updated_at current on profile changes
-- -------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute procedure public.set_updated_at();
