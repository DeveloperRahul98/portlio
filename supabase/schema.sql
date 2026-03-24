-- =============================================
-- Portlio Database Schema
-- Run this in your Supabase SQL Editor
-- =============================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ─── TABLES ───────────────────────────────────────────────────────────

-- Profiles (extends Supabase auth.users)
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  full_name text,
  avatar_url text,
  created_at timestamptz default now() not null
);

-- Clients (each = one portal)
create table if not exists public.clients (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  name text not null,
  email text,
  company text,
  portal_slug text unique not null,
  accent_color text default '#6366F1' not null,
  is_closed boolean default false not null,
  created_at timestamptz default now() not null
);

-- Projects
create table if not exists public.projects (
  id uuid default uuid_generate_v4() primary key,
  client_id uuid references public.clients(id) on delete cascade not null,
  title text not null,
  description text,
  status text default 'kickoff' check (status in ('kickoff', 'in_progress', 'review', 'complete')),
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- Updates (activity timeline)
create table if not exists public.updates (
  id uuid default uuid_generate_v4() primary key,
  project_id uuid references public.projects(id) on delete cascade not null,
  content text not null,
  created_at timestamptz default now() not null
);

-- Files metadata
create table if not exists public.files (
  id uuid default uuid_generate_v4() primary key,
  project_id uuid references public.projects(id) on delete cascade not null,
  file_name text not null,
  storage_path text not null,
  file_size bigint,
  file_type text,
  created_at timestamptz default now() not null
);

-- Invoices
create table if not exists public.invoices (
  id uuid default uuid_generate_v4() primary key,
  project_id uuid references public.projects(id) on delete cascade not null,
  line_items jsonb default '[]' not null,
  total numeric(10,2) default 0 not null,
  currency text default 'INR' not null,
  status text default 'draft' check (status in ('draft', 'sent', 'paid')),
  notes text,
  payment_proof_url text,
  created_at timestamptz default now() not null
);

-- Comments (client replies on updates)
create table if not exists public.comments (
  id uuid default uuid_generate_v4() primary key,
  update_id uuid references public.updates(id) on delete cascade not null,
  author_name text not null,
  content text not null,
  is_client boolean default false not null,
  created_at timestamptz default now() not null
);

-- Status history (tracks status changes for analytics)
create table if not exists public.status_history (
  id uuid default uuid_generate_v4() primary key,
  project_id uuid references public.projects(id) on delete cascade not null,
  from_status text not null,
  to_status text not null,
  created_at timestamptz default now() not null
);

-- ─── INDEXES ──────────────────────────────────────────────────────────

create index if not exists clients_user_id_idx on public.clients(user_id);
create index if not exists clients_portal_slug_idx on public.clients(portal_slug);
create index if not exists projects_client_id_idx on public.projects(client_id);
create index if not exists updates_project_id_idx on public.updates(project_id);
create index if not exists files_project_id_idx on public.files(project_id);
create index if not exists invoices_project_id_idx on public.invoices(project_id);
create index if not exists comments_update_id_idx on public.comments(update_id);
create index if not exists status_history_project_id_idx on public.status_history(project_id);

-- ─── ROW LEVEL SECURITY ───────────────────────────────────────────────

alter table public.profiles enable row level security;
alter table public.clients enable row level security;
alter table public.projects enable row level security;
alter table public.updates enable row level security;
alter table public.files enable row level security;
alter table public.invoices enable row level security;
alter table public.comments enable row level security;
alter table public.status_history enable row level security;

-- Profiles
create policy "profiles_select_own" on public.profiles for select using (auth.uid() = id);
create policy "profiles_insert_own" on public.profiles for insert with check (auth.uid() = id);
create policy "profiles_update_own" on public.profiles for update using (auth.uid() = id);

-- Clients: owner manages, public can read (for portal view)
create policy "clients_owner_all" on public.clients for all using (auth.uid() = user_id);
create policy "clients_public_read" on public.clients for select using (true);

-- Projects: owner manages, public can read
create policy "projects_owner_all" on public.projects for all using (
  exists (select 1 from public.clients c where c.id = projects.client_id and c.user_id = auth.uid())
);
create policy "projects_public_read" on public.projects for select using (true);

-- Updates: owner manages, public can read
create policy "updates_owner_all" on public.updates for all using (
  exists (
    select 1 from public.projects p
    join public.clients c on c.id = p.client_id
    where p.id = updates.project_id and c.user_id = auth.uid()
  )
);
create policy "updates_public_read" on public.updates for select using (true);

-- Files: owner manages, public can read
create policy "files_owner_all" on public.files for all using (
  exists (
    select 1 from public.projects p
    join public.clients c on c.id = p.client_id
    where p.id = files.project_id and c.user_id = auth.uid()
  )
);
create policy "files_public_read" on public.files for select using (true);

-- Invoices: owner manages, public can read non-draft
create policy "invoices_owner_all" on public.invoices for all using (
  exists (
    select 1 from public.projects p
    join public.clients c on c.id = p.client_id
    where p.id = invoices.project_id and c.user_id = auth.uid()
  )
);
create policy "invoices_public_read" on public.invoices for select using (status != 'draft');
create policy "invoices_public_update" on public.invoices for update using (status != 'draft');

-- Comments: owner manages, public (client) can insert and read
create policy "comments_owner_all" on public.comments for all using (
  exists (
    select 1 from public.updates u
    join public.projects p on p.id = u.project_id
    join public.clients c on c.id = p.client_id
    where u.id = comments.update_id and c.user_id = auth.uid()
  )
);
create policy "comments_public_read" on public.comments for select using (true);
create policy "comments_public_insert" on public.comments for insert with check (true);

-- Status history: owner manages and reads; not publicly accessible
create policy "status_history_owner_all" on public.status_history for all using (
  exists (
    select 1 from public.projects p
    join public.clients c on c.id = p.client_id
    where p.id = status_history.project_id and c.user_id = auth.uid()
  )
);

-- ─── STORAGE BUCKET ───────────────────────────────────────────────────
-- Run this in Supabase Dashboard > Storage > New bucket
-- Name: portal-files
-- Public: false (we use signed URLs)
-- File size limit: 52428800 (50MB)

-- Storage RLS policies (run after creating the bucket):
-- insert into storage.buckets (id, name, file_size_limit, allowed_mime_types)
-- values ('portal-files', 'portal-files', 52428800, null);

-- create policy "Authenticated users upload" on storage.objects
-- for insert to authenticated with check (bucket_id = 'portal-files');

-- create policy "Owner can manage files" on storage.objects
-- for all to authenticated using (auth.uid()::text = (storage.foldername(name))[1]);

-- create policy "Public signed URL access" on storage.objects
-- for select using (bucket_id = 'portal-files');

-- ─── TRIGGER: Auto-create profile on signup ───────────────────────────

create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.email)
  )
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ─── TRIGGER: Auto-update updated_at on projects ──────────────────────

create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists set_projects_updated_at on public.projects;
create trigger set_projects_updated_at
  before update on public.projects
  for each row execute procedure public.handle_updated_at();
