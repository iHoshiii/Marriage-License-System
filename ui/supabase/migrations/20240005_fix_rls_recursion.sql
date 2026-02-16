-- 1. CLEANUP: Drop ALL existing policies on public.profiles to remove conflicts and recursion
-- We need to specific about which policies to drop, or just drop them all if possible.
-- Since we can't easily iterate drop in standard SQL script without DO block, we'll list known suspects.

drop policy if exists "Public profiles are viewable by everyone." on public.profiles;
drop policy if exists "Users can view own profile" on public.profiles;
drop policy if exists "Profiles are viewable by owner and staff" on public.profiles;
drop policy if exists "users_employees_manage_own_profile" on public.profiles;
drop policy if exists "admins_view_all_profiles" on public.profiles;
drop policy if exists "admins_manage_employees" on public.profiles;
drop policy if exists "Enable read access for all users" on public.profiles;
drop policy if exists "Enable insert for authenticated users only" on public.profiles;
drop policy if exists "Enable update for users based on email" on public.profiles;

-- 2. Ensure the Secure Function exists (Security Definer to bypass recursion)
create or replace function public.is_admin_or_employee()
returns boolean as $$
begin
  -- This runs with elevated privileges, so it can read `role` even if RLS blocks the user
  return exists (
    select 1 from public.profiles
    where id = auth.uid()
    and role in ('admin', 'employee')
  );
end;
$$ language plpgsql security definer;

-- 3. Re-Create the Single, Correct Policy for SELECT
create policy "profiles_select_policy" 
on public.profiles for select 
using (
  auth.uid() = id -- User can see themselves
  or 
  public.is_admin_or_employee() -- Admin/Employee can see everyone (via secure function)
);

-- 4. Re-Create Policy for UPDATE (Users update self, Admins update all)
create policy "profiles_update_policy" 
on public.profiles for update
using (
  auth.uid() = id 
  or 
  public.is_admin_or_employee() -- Simplified: Admins/Employees can update any profile (subject to trigger restrictions)
);

-- 5. Re-Create Policy for INSERT (Users insert self)
create policy "profiles_insert_policy" 
on public.profiles for insert 
with check (
  auth.uid() = id
);
