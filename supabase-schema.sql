-- Vehicles table for Jen Freight Solutions admin dashboard
-- Run this in the Supabase SQL editor.

create table if not exists public.vehicles (
  id text primary key,
  name text not null,
  category text not null default 'Luxury Sedan',
  year integer not null default 2020,
  price text not null default '$0',
  fuel text not null default 'Petrol',
  transmission text not null default 'Automatic',
  image text not null default 'benz c200.jpeg',
  status text not null default 'Available',
  summary text not null default '',
  created_at timestamptz not null default now()
);

-- Optional: add an index for faster filtering by status/category
create index if not exists idx_vehicles_status
  on public.vehicles (status);

create index if not exists idx_vehicles_category
  on public.vehicles (category);

-- Enable Row Level Security (recommended for production)
alter table public.vehicles enable row level security;

-- Allow public read access if the catalogue should be visible to everyone
create policy "Vehicles are viewable by everyone"
  on public.vehicles
  for select
  using (true);

-- Allow authenticated admin users to insert, update, and delete records
create policy "Admins can manage vehicles"
  on public.vehicles
  for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

-- Optional helper view for quick dashboard queries
create or replace view public.vehicle_catalogue as
select
  id,
  name,
  category,
  year,
  price,
  fuel,
  transmission,
  image,
  status,
  summary,
  created_at
from public.vehicles
order by created_at desc;

-- Real admin authentication flow using Supabase Auth
-- This keeps login in auth.users and stores admin metadata in a public profile table.

create table if not exists public.admin_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  full_name text not null default 'Admin User',
  role text not null default 'admin' check (role in ('admin', 'editor')),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.handle_new_admin_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.admin_profiles (id, email, full_name, role, is_active)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', 'Admin User'),
    'admin',
    true
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

create or replace trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_admin_user();

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.admin_profiles ap
    where ap.id = auth.uid()
      and ap.is_active = true
      and ap.role = 'admin'
  );
$$;

alter table public.admin_profiles enable row level security;

create policy "Users can view their own profile"
  on public.admin_profiles
  for select
  using (auth.uid() = id);

create policy "Admins can view all profiles"
  on public.admin_profiles
  for select
  using (public.is_admin());

create policy "Users can update their own profile"
  on public.admin_profiles
  for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

create policy "Admins can update profiles"
  on public.admin_profiles
  for update
  using (public.is_admin())
  with check (public.is_admin());

-- Create an admin user through Supabase Auth UI or SQL insert into auth.users.
-- Example for a manually created admin account in Supabase Auth:
-- 1. Go to Authentication > Users > Add user
-- 2. Create the email and password in the dashboard
-- 3. The trigger above will create a matching admin profile automatically.

-- Optional: if you want to promote an existing user to admin manually:
-- update public.admin_profiles
-- set role = 'admin', is_active = true
-- where email = 'admin@jenfreightsolutions.com';
