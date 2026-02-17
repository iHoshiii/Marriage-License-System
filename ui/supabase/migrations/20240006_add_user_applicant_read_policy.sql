-- Add SELECT policy for applicants table to allow users to read applicants for their own applications
drop policy if exists "users_read_own_applicants" on public.applicants;
create policy "users_read_own_applicants" on public.applicants for select using (
  EXISTS (
    SELECT 1 FROM public.marriage_applications ma
    WHERE ma.id = applicants.application_id
    AND ma.created_by = auth.uid()
  )
);