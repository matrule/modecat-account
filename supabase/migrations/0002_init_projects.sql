-- ============================================================
-- 0002_init_projects.sql
-- Projects table, RLS, storage bucket, and storage policies
-- ============================================================

create table public.projects (
  id             uuid primary key default gen_random_uuid(),
  owner_id       uuid references public.profiles(id) on delete cascade not null,
  title          text not null default 'Untitled Project',
  description    text,
  slug           text unique,
  is_public      boolean default false not null,
  file_path      text not null,     -- storage path: {owner_id}/{id}.json
  cover_url      text,
  bpm            integer check (bpm > 0 and bpm < 1000),
  tags           text[] default '{}' not null,
  play_count     bigint default 0 not null,
  forked_from    uuid references public.projects(id) on delete set null,
  schema_version integer default 1 not null,
  created_at     timestamptz default now() not null,
  updated_at     timestamptz default now() not null
);

-- Slug format: lowercase alphanumeric + hyphens
alter table public.projects
  add constraint projects_slug_format
  check (slug ~ '^[a-z0-9][a-z0-9\-]{0,62}[a-z0-9]$');

-- Index: fast listing by owner, most recently updated first
create index projects_owner_updated_idx
  on public.projects (owner_id, updated_at desc);

-- Index: public project discovery
create index projects_public_idx
  on public.projects (is_public, updated_at desc)
  where is_public = true;

-- Keep updated_at current
create trigger projects_set_updated_at
  before update on public.projects
  for each row execute procedure public.set_updated_at();

-- -------------------------------------------------------
-- Row-level security
-- -------------------------------------------------------
alter table public.projects enable row level security;

create policy "Owners can do everything with their projects"
  on public.projects for all
  using (auth.uid() = owner_id)
  with check (auth.uid() = owner_id);

create policy "Anyone can read public projects"
  on public.projects for select
  using (is_public = true);

-- -------------------------------------------------------
-- Storage: projects bucket
-- Private bucket — files served via signed URLs only
-- -------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'projects',
  'projects',
  false,
  10485760,   -- 10 MB per project file
  array['application/json']
)
on conflict (id) do nothing;

-- Storage RLS: users can only touch their own folder
create policy "Users can upload their own project files"
  on storage.objects for insert
  with check (
    bucket_id = 'projects'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Users can update their own project files"
  on storage.objects for update
  using (
    bucket_id = 'projects'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Users can delete their own project files"
  on storage.objects for delete
  using (
    bucket_id = 'projects'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Users can read their own project files"
  on storage.objects for select
  using (
    bucket_id = 'projects'
    and auth.uid()::text = (storage.foldername(name))[1]
  );
