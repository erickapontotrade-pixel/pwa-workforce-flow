
create policy "move files own write" on storage.objects for insert to authenticated
with check (bucket_id = 'move-files' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "move files own delete" on storage.objects for delete to authenticated
using (bucket_id = 'move-files' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "move files read" on storage.objects for select to authenticated
using (bucket_id = 'move-files' and (
  (storage.foldername(name))[1] = auth.uid()::text
  or public.is_staff(auth.uid())
  or exists (select 1 from public.freelance_evidence e join public.freelance_assignments a on a.id = e.assignment_id
     where e.file_path = storage.objects.name and public.is_company_member(auth.uid(), a.company_id))
  or exists (select 1 from public.documents d join public.applications ap on ap.professional_id = d.professional_id
     join public.jobs j on j.id = ap.job_id where d.file_path = storage.objects.name and public.is_company_member(auth.uid(), j.company_id))
));
