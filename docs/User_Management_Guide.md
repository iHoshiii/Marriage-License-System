# User Management Guide

This guide explains how to manage user roles within the Solano Marriage License System.

## Prerequisites

Ensure you have run the following SQL migration in your Supabase Dashboard > SQL Editor:
- `ui/supabase/migrations/20240001_setup_roles.sql` (Initial setup)
- `ui/supabase/migrations/20240002_secure_profile_updates.sql` (Security & Functions)

## Role Hierarchy

1.  **User**: Standard applicant role. Automatically assigned upon signup.
2.  **Employee**: LGU staff authorized to process applications.
3.  **Admin**: System administrator with full control over user roles and system settings.

## Setting Up the First Admin

Since no users start as Admin, you must manually promote your first account via SQL or the Supabase dashboard.

### Method 1: Using SQL Helper Function (easiest)

After running the migration scripts, you can use the helper functions directly:

```sql
-- Replace with your actual email
select public.make_admin('your-email@example.com');
```

Run this in the Supabase SQL Editor.

### Method 2: Direct Table Modification

1.  Go to **Table Editor** > `public.profiles`.
2.  Find the row corresponding to your user account.
3.  Manually change the `role` column value from `user` to `admin`.
4.  Save changes.

## Creating Employee Accounts

Admins can create employee accounts either by inviting new users or promoting existing ones.

### Option A: Promoting an Existing Sign-up

1.  Ask the employee to sign up for an account normally via the website.
2.  Once confirmed, run the following SQL command or use an Admin dashboard tool (future implementation):

```sql
select public.make_employee('employee-email@example.com');
```

### Option B: Direct Table Edit

1.  Go to **Table Editor** > `public.profiles`.
2.  Find the target user.
3.  Change `role` to `employee`.

## Security Features

The `20240002_secure_profile_updates.sql` migration introduces security measures:

-   **Role Protection**: Standard users cannot update their own `role` field. Attempts to do so via API calls will be rejected by the trigger `prevent_role_change`.
-   **Service Role Access**: Only server-side functions (Service Role) or existing Admins (via future RLS logic) can modify roles.

## Verification

To verify permissions:
1.  Login as a standard user.
2.  Attempt to access `/dashboard` (should see "User" role).
3.  Attempt to access `/admin` (should redirect to `/dashboard`).
4.  Promote the user to Admin.
5.  Access `/admin` (should succeed, though the page is yet to be built fully).
