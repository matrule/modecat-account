-- Add tracker-populated stats columns to projects table.
-- block_count and file_size_bytes are written by the tracker on each save
-- via cloud.saveProject() — they're null until the first cloud save.

alter table public.projects
  add column if not exists block_count    integer,
  add column if not exists file_size_bytes bigint;
