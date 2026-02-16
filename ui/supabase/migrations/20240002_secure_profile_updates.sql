-- 1. Function to prevent users from updating their own role
create or replace function public.prevent_role_change()
returns trigger as $$
begin
  -- Check if the role is being changed
  if new.role is distinct from old.role then
    -- Allow service_role (server-side)
    if (current_setting('request.jwt.claim.role', true) = 'service_role') then
       return new;
    end if;

    -- Allow Supabase Dashboard/SQL Editor (superuser)
    if current_user in ('postgres', 'supabase_admin') then
       return new;
    end if;

    -- Allow existing admins to change roles
    if (select count(*) from public.profiles where id = auth.uid() and role = 'admin') > 0 then
       return new;
    end if;
    
    raise exception 'You are not authorized to change user roles. Current user role: %, DB user: %', auth.role(), current_user;
  end if;
  return new;
end;
$$ language plpgsql security definer;

-- 2. Trigger
drop trigger if exists on_profile_role_change on public.profiles;
create trigger on_profile_role_change
  before update on public.profiles
  for each row execute procedure public.prevent_role_change();

-- 3. Helper Function to Make a User an Admin (Call via SQL Editor)
create or replace function public.make_admin(target_email text)
returns void as $$
declare
  target_id uuid;
begin
  select id into target_id from auth.users where email = target_email;
  
  if target_id is null then
    raise exception 'User not found';
  end if;

  update public.profiles
  set role = 'admin'
  where id = target_id;
end;
$$ language plpgsql security definer;

-- 4. Helper Function to Make a User an Employee
create or replace function public.make_employee(target_email text)
returns void as $$
declare
  target_id uuid;
begin
  select id into target_id from auth.users where email = target_email;
  
  if target_id is null then
    raise exception 'User not found';
  end if;

  update public.profiles
  set role = 'employee'
  where id = target_id;
end;
$$ language plpgsql security definer;
