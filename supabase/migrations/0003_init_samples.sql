-- ============================================================
-- 0003_init_samples.sql
-- Samples table, RLS, storage buckets (samples + avatars)
-- ============================================================

create table public.samples (
  id          uuid primary key default gen_random_uuid(),
  owner_id    uuid references public.profiles(id) on delete cascade not null,
  project_id  uuid references public.projects(id) on delete set null,
  name        text not null,
  file_path   text not null,     -- storage path: {owner_id}/{id}.{ext}
  file_size   integer check (file_size > 0),
  duration_ms integer check (duration_ms >= 0),
  mime_type   text,
  is_public   boolean default false not null,
  created_at  timestamptz default now() not null
);

-- Allowed audio MIME types
alter table public.samples
  add constraint samples_mime_type_audio
  check (
    mime_type is null or
    mime_type in (
      'audio/wav', 'audio/x-wav',
      'audio/mpeg', 'audio/mp3',
      'audio/ogg', 'audio/flac',
      'audio/aiff', 'audio/x-aiff'
    )
  );

-- Index: fast listing by owner
create index samples_owner_idx on public.samples (owner_id, created_at desc);

-- Index: samples attached to a project
create index samples_project_idx on public.samples (project_id) where project_id is not null;

-- -------------------------------------------------------
-- Row-level security
-- -------------------------------------------------------
alter table public.samples enable row level security;

create policy "Owners can manage their samples"
  on public.samples for all
  using (auth.uid() = owner_id)
  with check (auth.uid() = owner_id);

create policy "Anyone can read public samples"
  on public.samples for select
  using (is_public = true);

-- -------------------------------------------------------
-- Storage: samples bucket (private, per-row visibility)
-- -------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'samples',
  'samples',
  false,
  52428800,   -- 50 MB per sample
  array[
    'audio/wav', 'audio/x-wav',
    'audio/mpeg', 'audio/mp3',
    'audio/ogg', 'audio/flac',
    'audio/aiff', 'audio/x-aiff'
  ]
)
on conflict (id) do nothing;

create policy "Users can upload their own samples"
  on storage.objects for insert
  with check (
    bucket_id = 'samples'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Users can update their own samples"
  on storage.objects for update
  using (
    bucket_id = 'samples'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Users can delete their own samples"
  on storage.objects for delete
  using (
    bucket_id = 'samples'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Users can read their own samples"
  on storage.objects for select
  using (
    bucket_id = 'samples'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

-- -------------------------------------------------------
-- Storage: avatars bucket (public read)
-- -------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'avatars',
  'avatars',
  true,
  2097152,    -- 2 MB
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
on conflict (id) do nothing;

create policy "Users can upload their own avatar"
  on storage.objects for insert
  with check (
    bucket_id = 'avatars'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Users can update their own avatar"
  on storage.objects for update
  using (
    bucket_id = 'avatars'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Users can delete their own avatar"
  on storage.objects for delete
  using (
    bucket_id = 'avatars'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

-- Avatars are in a public bucket, so no SELECT policy needed —
-- the bucket's public flag handles read access.
