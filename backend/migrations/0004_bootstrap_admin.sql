-- Auto-promote a known bootstrap email to admin on sign-up.
-- Replaces handle_new_user() from 0001 with an admin-email check.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
    assigned_role text;
begin
    assigned_role := coalesce(new.raw_user_meta_data ->> 'role', 'customer');
    if lower(new.email) = 'sivakumarai2828@gmail.com' then
        assigned_role := 'admin';
    end if;

    insert into public.users (id, email, name, phone, role)
    values (
        new.id,
        new.email,
        coalesce(new.raw_user_meta_data ->> 'name', ''),
        new.raw_user_meta_data ->> 'phone',
        assigned_role
    )
    on conflict (id) do nothing;
    return new;
end;
$$;

revoke execute on function public.handle_new_user() from anon, authenticated, public;

-- Promote the account if it already exists.
update public.users set role = 'admin'
where lower(email) = 'sivakumarai2828@gmail.com';
