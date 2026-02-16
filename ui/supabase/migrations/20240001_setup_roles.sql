-- 1. Create profiles table if it doesn't exist
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  updated_at timestamp with time zone,
  username text unique,
  full_name text,
  avatar_url text,
  website text,
  role text default 'user' check (role in ('user', 'admin', 'employee'))
);

-- 2. Add 'role' column if it doesn't exist (idempotent)
do $$
begin
  if not exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'profiles' and column_name = 'role') then
    alter table public.profiles add column role text default 'user' check (role in ('user', 'admin', 'employee'));
  else
    -- Update the check constraint to include 'employee' if it exists but is old
    -- Dropping constraint is safer
    alter table public.profiles drop constraint if exists profiles_role_check;
    alter table public.profiles add constraint profiles_role_check check (role in ('user', 'admin', 'employee'));
  end if;
end $$;

-- 3. Enable RLS
alter table public.profiles enable row level security;

-- 4. Create policies

-- Policy: Public profiles are viewable by everyone
drop policy if exists "Public profiles are viewable by everyone." on public.profiles;
create policy "Public profiles are viewable by everyone." on public.profiles for select using (true);

-- Policy: Users can insert their own profile
drop policy if exists "Users can insert their own profile." on public.profiles;
create policy "Users can insert their own profile." on public.profiles for insert with check ((select auth.uid()) = id);

-- Policy: Users can update their own profile
drop policy if exists "Users can update own profile." on public.profiles;
create policy "Users can update own profile." on public.profiles for update using ((select auth.uid()) = id);

-- 5. Function to handle new user signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, avatar_url, role)
  values (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url', 'user')
  on conflict (id) do nothing; -- Handle potential race conditions
  return new;
end;
$$ language plpgsql security definer;

-- 6. Trigger
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
