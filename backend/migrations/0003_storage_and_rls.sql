-- Storage bucket + Row Level Security. Run after 0001_init.sql.
-- This reflects the hardened state applied to the live project.

-- ---------------------------------------------------------------------------
-- Public image bucket
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('item-images', 'item-images', true)
on conflict (id) do nothing;

-- Public buckets serve objects via their public URL with no SELECT policy, so
-- we intentionally do NOT add a broad read policy (it would only enable file
-- listing / enumeration). Authenticated users may upload and manage their own.
drop policy if exists "Authenticated upload item images" on storage.objects;
create policy "Authenticated upload item images"
    on storage.objects for insert
    to authenticated
    with check (bucket_id = 'item-images');

drop policy if exists "Owners manage their item images" on storage.objects;
create policy "Owners manage their item images"
    on storage.objects for update
    to authenticated
    using (bucket_id = 'item-images' and owner = auth.uid());

drop policy if exists "Owners delete their item images" on storage.objects;
create policy "Owners delete their item images"
    on storage.objects for delete
    to authenticated
    using (bucket_id = 'item-images' and owner = auth.uid());

-- ---------------------------------------------------------------------------
-- Lock down the public PostgREST API for all app tables.
--
-- The FastAPI backend connects with a direct Postgres role and bypasses RLS,
-- so the app keeps working. Enabling RLS with no policies denies all
-- anon/authenticated access through PostgREST (the data API). This produces
-- INFO-level "RLS enabled, no policy" linter notices — that is the intended
-- state. If you later want browser-direct PostgREST access, add explicit
-- policies (e.g. public read of active items).
-- ---------------------------------------------------------------------------
alter table public.users            enable row level security;
alter table public.categories       enable row level security;
alter table public.items            enable row level security;
alter table public.item_images      enable row level security;
alter table public.availability     enable row level security;
alter table public.booking_requests enable row level security;
alter table public.booking_items    enable row level security;

-- handle_new_user is a SECURITY DEFINER trigger function; it must never be
-- callable as a PostgREST RPC. Triggers still fire after revoking EXECUTE.
revoke execute on function public.handle_new_user() from anon, authenticated, public;
