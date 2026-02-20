-- Create the check_user_role function referenced in RLS policies
create or replace function public.check_user_role(required_roles text[])
returns boolean as $$
begin
  -- This function checks if the current user has one of the required roles
  return exists (
    select 1 from public.profiles
    where id = auth.uid()
    and role = any(required_roles)
  );
end;
$$ language plpgsql security definer;