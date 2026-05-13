-- Receipt storage for contribution entries

alter table if exists public.contributions
  add column if not exists receipt_number text;

alter table if exists public.contributions
  add column if not exists receipt_url text;

alter table if exists public.contributions
  add column if not exists receipt_created_at timestamptz;

create unique index if not exists contributions_receipt_number_key
  on public.contributions (receipt_number)
  where receipt_number is not null;

insert into storage.buckets (id, name, public)
values ('e-receipts', 'e-receipts', true)
on conflict (id) do update
set public = true;

drop policy if exists "Public read e-receipts" on storage.objects;
create policy "Public read e-receipts"
on storage.objects for select
to public
using (bucket_id = 'e-receipts');

drop policy if exists "Allow anon upload e-receipts" on storage.objects;
create policy "Allow anon upload e-receipts"
on storage.objects for insert
to public
with check (bucket_id = 'e-receipts');

drop policy if exists "Allow anon update e-receipts" on storage.objects;
create policy "Allow anon update e-receipts"
on storage.objects for update
to public
using (bucket_id = 'e-receipts')
with check (bucket_id = 'e-receipts');

drop policy if exists "Allow anon delete e-receipts" on storage.objects;
create policy "Allow anon delete e-receipts"
on storage.objects for delete
to public
using (bucket_id = 'e-receipts');