# SQL Role Management Cheatsheet

Use these SQL commands in your **Supabase Dashboard > SQL Editor** to manually manage user roles.

## Prerequisite
Ensure you have run the migration scripts to set up the helper functions (specifically `make_admin` and `make_employee`).

## 1. Promote a User to Admin
Gives full access to the system, including all dashboards and settings.

```sql
-- Replace with the actual email address of the user
select public.make_admin('user@example.com');
```

## 2. Promote a User to Employee
Gives access to the Employee Dashboard for processing applications.

```sql
-- Replace with the actual email address of the user
select public.make_employee('user@example.com');
```

## 3. Revert a User to Standard Role
Removes admin/employee privileges and returns them to a standard user.

```sql
-- Replace with the actual email address
update public.profiles 
set role = 'user' 
where id = (select id from auth.users where email = 'user@example.com');
```

## 4. Check Current Role
Quickly check the role of a specific user.

```sql
select auth.users.email, public.profiles.role 
from public.profiles 
join auth.users on profiles.id = auth.users.id
where auth.users.email = 'user@example.com';
```

## 5. List All Staff
View all admins and employees in the system.

```sql
select auth.users.email, public.profiles.role 
from public.profiles 
join auth.users on profiles.id = auth.users.id
where public.profiles.role in ('admin', 'employee');
```
