# Phase 2 Verification Checklist

Follow these steps to ensure the manual setup process, role assignments, and security policies are working correctly.

## 1. Prerequisites
Ensure you have run all three migration scripts in the Supabase SQL Editor:
- `20240001_setup_roles.sql` (Tables & basic triggers)
- `20240002_secure_profile_updates.sql` (Security & Helper functions)
- `20240003_secure_visibility.sql` (RLS Policies)

## 2. Verify Helper Functions & Role Assignment

**Goal**: Confirm that you can manually promote a user to Admin or Employee.

1.  **Sign Up a New User**:
    -   Go to your local app (http://localhost:3000/login).
    -   Sign up with a new email (e.g., `test_admin@example.com`).
    -   Confirm the email (if enabled) or check the Supabase `auth.users` table.

2.  **Check Default Role**:
    -   Go to Supabase Dashboard > **Table Editor** > `public.profiles`.
    -   Find `test_admin@example.com`.
    -   Verify the `role` column says `user`.

3.  **Run Promotion Function**:
    -   Go to Supabase Dashboard > **SQL Editor**.
    -   Run: `select public.make_admin('test_admin@example.com');`
    -   *Success Output*: Should return `void` (no error).

4.  **Verify Change**:
    -   Go back to **Table Editor** > `public.profiles`.
    -   Verify the `role` column now says `admin`.

## 3. Verify Access Control (Middleware)

**Goal**: Confirm that the app restricts access based on the role.

1.  **Login as the Admin User**:
    -   Log in with `test_admin@example.com`.
    -   Visit `/dashboard`.
    -   **Expected**: You should see "Role: **Administrator**" (or "Admin") in the Account Details card.

2.  **Test Restricted Route (Admin-only)**:
    -   *Note*: We haven't built the `/admin` page yet, but we can test the middleware redirect.
    -   Try to visit `http://localhost:3000/admin`.
    -   **Expected**:
        -   If you are **Admin**: You should stay on `/admin` (likely seeing a 404 Not Found if the page doesn't exist, but *not* a redirect to dashboard).
        -   If you were a **User**: You would be immediately redirected to `/dashboard`.

3.  **Downgrade & Retest**:
    -   In Supabase SQL Editor: `update public.profiles set role = 'user' where id = (select id from auth.users where email = 'test_admin@example.com');`
    -   Refresh the app.
    -   Try to visit `http://localhost:3000/admin`.
    -   **Expected**: Immediate redirect to `/dashboard`.

## 4. Verify RLS (Data Privacy)

**Goal**: Confirm that users cannot see other users' confidential data.

1.  **Simulate Data Access in SQL Editor**:
    Running queries in the SQL editor usually bypasses RLS (because you are an admin). To test RLS, we simulate a specific user.

    Run this script in SQL Editor (replace `USER_ID_HERE` with the UUID of a standard user):

    ```sql
    -- 1. Switch to authenticated context
    select set_config('role', 'authenticated', true);
    
    -- 2. Impersonate the specific user
    select set_config('request.jwt.claim.sub', 'USER_ID_HERE', true);
    
    -- 3. Try to view ALL profiles
    select * from public.profiles;
    ```

    **Expected Result**:
    -   You should **only see 1 row** (the profile matching `USER_ID_HERE`).
    -   You should *not* see any other profiles.

2.  **Simulate Admin Access**:
    Repeat the above with an Admin's UUID.
    
    **Expected Result**:
    -   You should see **all rows** in the profiles table.
